import { Entity, Property } from '@mikro-orm/core'
import { Field, ObjectType } from 'type-graphql'
import { MongoClass } from './MongoClass'

// @InputType()
// export class adminPostInput {
// 	@Field()
// 	title: string
// }

@ObjectType({ implements: MongoClass })
@Entity()
export class Post extends MongoClass {
	@Field()
	@Property({ type: 'text' })
	title!: string
  creator: any
}