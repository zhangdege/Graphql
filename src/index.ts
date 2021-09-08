import { MikroORM } from '@mikro-orm/core'
import { ApolloServer } from 'apollo-server-express'
import connectRedis from 'connect-redis'
import cors from 'cors'
import dotenv from 'dotenv'
import express, { Request, Response } from 'express'
import session from 'express-session'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import { graphqlUploadExpress } from 'graphql-upload'
import http from 'http'
import Redis from 'ioredis'
import path from 'path'
import { buildSchema } from 'type-graphql'
import myMikroconfig from './mikro-orm.config'
import { BtcNotic } from './resolvers/btcResolver'
import { DownloadFiles } from './resolvers/downLoadfiles'
import { DataFromExcel } from './resolvers/exploreExcelFile'
import { Hello } from './resolvers/Hello'
import { PaymentResolver } from './resolvers/order'
import { PostResolver } from './resolvers/post'
import { PictureUpload } from './resolvers/uploadImage'
import { UserResolve } from './resolvers/user'
import { usersTestResolver } from './utils/resolverGenerator'
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const main = async () => {
	const app = express()
	const orm = await MikroORM.init(myMikroconfig)
	app.use('/static', express.static(path.join(__dirname, '..', '/public')))
	/**
	 * !文件上传必备配置
	 */
	app.use('/graphql', graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }))
	app.use(express.json())
	app.set('trust proxy', 1)
	/**原来的做法 */
	app.use(
		cors({
			credentials: true,
			origin: process.env.FRONTEND_URL,
		})
	)

	const RedisStore = connectRedis(session)
	const options: Redis.RedisOption = {
		host: process.env.REDIS_URL,
		// password: process.env.REDIS_PASSWORD,  //dev_env Not the pwd,if you are has the password,please add paaword with it.
		retryStrategy: (times) => Math.max(times * 100, 3000),
	}
	const redis = new Redis(process.env.REDIS_URL, options)
	const pubSub = new RedisPubSub({
		publisher: new Redis(process.env.REDIS_URL, options),
		subscriber: new Redis(process.env.REDIS_URL, options),
	})

	const apolloServer = new ApolloServer({
		/**
		 * !必须禁用appolo的upload功能，才能正常上传
		 */
		uploads: false,
		schema: await buildSchema({
			resolvers: [
				PostResolver,
				UserResolve,
				PaymentResolver,
				Hello,
				usersTestResolver,
				PictureUpload,
				DownloadFiles,
				DataFromExcel,
				BtcNotic,
			],

			validate: false,
			pubSub,
		}),
		context: ({ req, res }) => {
			return {
				em: orm.em,
				req,
				res,
				redis,
			}
		},
	})
	app.use(
		session({
			name: process.env.COOKIE_NAME,
			store: new RedisStore({ client: redis, disableTouch: true }), // TOUCH 可以延长有效时间 TTL
			cookie: {
				maxAge: 1000 * 60 * 60 * parseInt(process.env.COOKIE_MAXAGE_HOURS),
				httpOnly: true,
				sameSite: 'lax', // csrf
				secure: process.env.NODE_ENV === 'production',
			},
			secret: process.env.REDIS_SECRET,
			saveUninitialized: false,
			resave: false,
		})
	)

	apolloServer.applyMiddleware({ app, cors: false })
	app.use(express.urlencoded({ extended: true }))
	app.post(process.env.ALIPAY_CB, async (req: Request, res: Response) => {
		// await alipayCallBack(req, res, orm.em, pubSub)
	})
	const httpServer = http.createServer(app)
	apolloServer.installSubscriptionHandlers(httpServer)
	app.all('/', (req, res) => {
		res.redirect('/graphql')
	})
	httpServer.listen(process.env.PORT, () => {
		console.log(`server at http://localhost:${process.env.PORT}`)
	})
}

main()
