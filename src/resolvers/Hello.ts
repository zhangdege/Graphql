import { PubSubEngine } from 'graphql-subscriptions'
import { PubSub, Query, Resolver, Subscription } from 'type-graphql'
import { PAYMENTNOTICE } from '../const/topicts'

@Resolver()
export class Hello {
	@Query(() => String)
	Hi(@PubSub() pubSub: PubSubEngine) {
		pubSub.publish(PAYMENTNOTICE, 'result')
		return 'Hello'
	}
	@Subscription(() => String, { topics: PAYMENTNOTICE })
	NoticeHi() {
		return 'hello'
	}
}
