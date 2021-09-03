import AlipaySdk from 'alipay-sdk'
import { Request, Response } from 'express'
import fs from 'fs'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import path from 'path'
import { PAYMENTSUCCESS } from '../const/topicts'
import { Order } from '../entities/Order'
import { User } from '../entities/User'
import { Mycontext } from '../mikro-orm.config'
const alipayFolder = [__dirname, '..', '..', 'files', 'alipay']
const alipaySdk = new AlipaySdk({
	appId: process.env.alipayId,
	privateKey: fs.readFileSync(
		path.join(...alipayFolder, 'private-key.pem'),
		'ascii'
	),
	alipayRootCertPath: path.join(...alipayFolder, 'alipayRootCert.crt'), //支付宝根证书
	appCertPath: path.join(...alipayFolder, 'appCertPublicKey.crt'), //应用公钥证书
	alipayPublicCertPath: path.join(...alipayFolder, 'alipayCertPublicKey_RSA2.crt'), //支付宝公钥证书
	encryptKey: 'J5KzPas4QW+gx0dL/vq6cw==',

	camelcase: true,
})

export const payAlipay = async (id: string, productName: string, price: number) => {
	const timestamp = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
	const notify_url = `http://${process.env.SERVER_URL}${process.env.ALIPAY_CB}`
	console.log(notify_url)
	const result = await alipaySdk.exec('alipay.trade.precreate', {
		timestamp,
		notify_url,
		bizContent: {
			out_trade_no: id,
			total_amount: price,
			subject: productName,
		},

		needEncrypt: true,
	})
	return result
}

const alipayCallBack = async (
	req: Request,
	res: Response,
	em: Mycontext['em'],
	pubSub: RedisPubSub
) => {
	let result = false
	try {
		result = alipaySdk.checkNotifySign(req.body)
	} catch (error) {
		console.log(error)
	}
	if (!result) {
		return res.send('validation fail')
	}
	const id = req.body.out_trade_no
	const order = await em.getRepository(Order).findOne({ id })
	if (!order) {
		return res.send('no order')
	}
	if (order.payed) {
		console.log('already payed')
		return res.status(200).send('success')
	}
	const user = await em.getRepository(User).findOne({ id: order.user.id })

	if (!user) {
		return res.send('server error')
	}
	const amount = Number(req.body.total_amount)
	if (order.amount !== amount) {
		return res.send('amount not match')
	}

	user.balance = user.balance + amount
	await em.persistAndFlush(user)
	order.payed = true
	order.paytime = new Date()
	await em.persistAndFlush(order)
	console.log(user)
	pubSub.publish(PAYMENTSUCCESS, true)
	return res.status(201).send('success')
}
export default { alipayCallBack }
