import { Entity, IdentifiedReference, ManyToOne, Property } from '@mikro-orm/core'
import { Field, ObjectType } from 'type-graphql'
import { MongoClass } from './MongoClass'
import { User } from './User'

// @InputType()
// export class adminPostInput {
// 	@Field()
// 	title: string
// }

@ObjectType({ implements: MongoClass })
@Entity()
export class Post extends MongoClass {
	@Field()
	@Property()
	title!: string

	@Field(() => User)
	@ManyToOne()
	creator!: IdentifiedReference<User>
}
