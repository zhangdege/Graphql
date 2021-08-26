import { Entity, Property } from '@mikro-orm/core'
import { Field, InputType, ObjectType } from 'type-graphql'
import { MongoClass } from './MongoClass'

@InputType()
export class adminUserInput {
	@Field()
	phone: string

	@Field()
	password?: string
}

@ObjectType({ implements: MongoClass })
@Entity()
export class User extends MongoClass {
	@Field(() => String)
	@Property({ type: 'text', unique: true })
	phone!: string

	@Property()
	password!: string

	// @Field(() => Float)
	// @Property()
	// balance = 0

	// @Field(() => [Post])
	// @OneToMany(() => Post, (post) => post.creator)
	// posts = new Collection<Post>(this)
}
