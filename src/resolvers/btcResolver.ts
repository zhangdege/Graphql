import request from 'request'
import {
	Field,
	ObjectType,
	PubSub,
	PubSubEngine,
	Query,
	Resolver,
	Root,
	Subscription,
} from 'type-graphql'
import { PAYMENTNOTICE } from '../const/topicts'

@ObjectType()
export class FieldInfoType {
	@Field({ nullable: true })
	symbol?: string
	@Field()
	primaryExchange?: string
	@Field()
	sector?: string
	@Field()
	calculationPrice?: string
	@Field()
	latestPrice?: string
	@Field()
	latestSource?: string
	@Field()
	latestUpdate?: string
	@Field()
	latestVolume?: string
	@Field()
	bidPrice?: string
	@Field()
	bidSize?: string
	@Field()
	askPrice?: string
	@Field()
	askSize?: string
	@Field()
	high?: string
	@Field()
	low?: string
	@Field()
	previousClose?: string
	@Field()
	change?: string
	@Field()
	changePercent?: string
}

@Resolver()
export class BtcNotic {
	// @Query(() => FieldInfoType)
	@Query(() => String)
	async toGetInfo(@PubSub() pubSub: PubSubEngine) {
		let stream: request.Request
		let partialMessage: string
		const connect = () => {
			stream = request({
				url: process.env.BTC_INFO_REQUEST_URL,
				headers: {
					'Content-Type': 'text/event-stream',
				},
			})
			stream.on('socket', () => {
				console.log('Connected')
			})
			stream.on('end', () => {
				console.log('Reconnecting')
				connect()
			})
			stream.on('complete', () => {
				console.log('Reconnecting')
				connect()
			})

			stream.on('error', (err) => {
				console.log('Error', err)
				connect()
			})
			stream.on('data', (response) => {
				const chunk = response.toString()
				let cleanedChunk = chunk.replace(/data: /g, '')

				if (partialMessage) {
					cleanedChunk = partialMessage + cleanedChunk
					partialMessage = ''
				}

				const chunkArray = cleanedChunk.split('\r\n\r\n')

				chunkArray.forEach(function (message) {
					if (message) {
						try {
							const quote = JSON.parse(message)[0]
							pubSub.publish(PAYMENTNOTICE, quote)
						} catch (error) {
							partialMessage = message
						}
					}
				})
			})
		}
		connect()

		return 'success'
	}

	@Subscription(() => FieldInfoType, { topics: PAYMENTNOTICE })
	btcInfo(@Root() opt: FieldInfoType) {
		const {
			symbol,
			primaryExchange,
			sector,
			calculationPrice,
			latestPrice,
			latestSource,
			latestUpdate,
			latestVolume,
			bidPrice,
			bidSize,
			askPrice,
			askSize,
			high,
			low,
			previousClose,
			change,
			changePercent,
		} = opt
		return {
			symbol,
			primaryExchange,
			sector,
			calculationPrice,
			latestPrice,
			latestSource,
			latestUpdate,
			latestVolume,
			bidPrice,
			bidSize,
			askPrice,
			askSize,
			high,
			low,
			previousClose,
			change,
			changePercent,
		}
	}
}
