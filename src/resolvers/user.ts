import dotenv from 'dotenv'
import path from 'path'
import {
	Arg,
	Ctx,
	Field,
	InputType,
	Mutation,
	ObjectType,
	Query,
	Resolver,
} from 'type-graphql'
import { User } from '../entities/User'
import { Mycontext } from '../mikro-orm.config'

dotenv.config({ path: path.join(__dirname, '..', '.env') })

@ObjectType()
export class FieldError {
	@Field()
	field: string
	@Field()
	message: string
}

@InputType()
class PhonePasswordInput {
	@Field()
	phone: string
	@Field()
	password: string
}

@ObjectType()
export class UserResponse {
	@Field(() => [FieldError], { nullable: true })
	errors?: FieldError[]
	@Field(() => User, { nullable: true })
	user?: User
	static createError(field: string, message: string) {
		return {
			user: undefined,
			errors: [
				{
					field,
					message,
				},
			],
		}
	}
}

@Resolver(User)
export class UserResolve {
	@Query(() => [User])
	getAlluser(@Ctx() { em }: Mycontext): Promise<User[]> {
		return em.find(User, {})
	}

	@Mutation(() => User)
	async createUser(
		@Ctx() { em }: Mycontext,
		@Arg('ruserData') ruserData: PhonePasswordInput
	): Promise<User | null> {
		const { phone, password } = ruserData
		const user = await em.findOne(User, { phone })

		if (user === null) {
			const userInfoforOne = em.create(User, { phone, password })
			await em.persistAndFlush(userInfoforOne)
			return userInfoforOne
		}

		return user
	}

	@Mutation(() => UserResponse)
	async userLogin(
		@Ctx() { em }: Mycontext,
		@Arg('userData') userData: PhonePasswordInput
	): Promise<UserResponse> {
		const { phone, password } = userData
		const user = await em.findOne(User, { phone, password })
		if (!user) {
			return UserResponse.createError('phone', '查无此用户')
		}
		if (password !== user.password) {
			return UserResponse.createError('password', '密码错误')
		}

		return { user }
	}
}
