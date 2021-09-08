import { PubSubEngine } from 'graphql-subscriptions'
import {
	Field,
	ObjectType,
	PubSub,
	Query,
	Resolver,
	Root,
	Subscription,
} from 'type-graphql'
import { PAYMENTNOTICE } from '../const/topicts'

@ObjectType()
class output {
	@Field()
	message: string
}

@Resolver()
export class Hello {
	@Query(() => output)
	Hi(@PubSub() pubSub: PubSubEngine) {
		const result = { message: '1234' }
		setInterval(() => {
			pubSub.publish(PAYMENTNOTICE, result)
		}, 2000)
		return result
	}
	@Subscription(() => output, { topics: PAYMENTNOTICE })
	NoticeHi(@Root() opt: output) {
		const { message } = opt
		return {
			message,
		}
	}
}
