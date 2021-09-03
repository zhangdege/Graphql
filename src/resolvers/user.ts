import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import path from 'path'
import {
	Arg,
	Ctx,
	Field,
	FieldResolver,
	InputType,
	Mutation,
	ObjectType,
	Query,
	Resolver,
	Root,
} from 'type-graphql'
import { Post } from '../entities/Post'
import { User } from '../entities/User'
import { Mycontext } from '../mikro-orm.config'
import { isPhone } from '../utils/isPhone'
import { sendSMSToken } from '../utils/sendSms'
import { setAuth } from '../utils/setAuth'

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
@InputType()
class PhoneTokenInput {
	@Field()
	phone: string
	@Field()
	token: string
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
	@FieldResolver(() => [Post])
	async posts(@Root() user: User, @Ctx() { em }: Mycontext): Promise<Post[]> {
		const posts = em.find(Post, { creator: user.id })
		return posts
	}

	@Query(() => [User])
	getAlluser(@Ctx() { em }: Mycontext): Promise<User[]> {
		return em.find(User, {})
	}

	@Mutation(() => UserResponse)
	async sendToken(
		@Ctx() { redis }: Mycontext,
		@Arg('phone') phone: string
	): Promise<UserResponse> {
		const token = Math.floor(Math.random() * (999999 - 100000) + 100000).toString()
		const toShort = await redis.get(process.env.PHONE_TOKEN_AT_TIME_PREFIX + phone)
		if (toShort) return UserResponse.createError('phone', '发送太频繁')
		await redis.set(
			process.env.PHONE_TOKEN_AT_TIME_PREFIX + phone,
			123,
			'EX',
			parseInt(process.env.PHONE_TOKEN_FREQUENCY_SECONDS!)
		)
		const setResult = await redis.set(
			process.env.PHONE_PREFIX + token,
			phone,
			'EX',
			parseInt(process.env.PHONE_TOKEN_EXPIRE_SECONDS!)
		)
		if (setResult !== 'OK') {
			return UserResponse.createError('phone', '服务器出错')
		}
		await sendSMSToken({ phone, smsToken: token })
		return UserResponse.createError('phone', '发送成功')
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
		@Ctx() { em, req }: Mycontext,
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
		setAuth(req.session, user)
		return { user }
	}

	@Mutation(() => UserResponse)
	async userPhoneLoginOrregist(
		@Ctx() { em, redis, req }: Mycontext,
		@Arg('tokenData') tokenData: PhoneTokenInput,
		@Arg('password', { nullable: true }) password: string
	): Promise<UserResponse> {
		const { phone, token } = tokenData
		if (!isPhone(phone) || !token) {
			return UserResponse.createError(
				'phone',
				'出错了,请检查你的token或者手机号码是否错误'
			)
		}
		const valiphone = await redis.get(process.env.PHONE_PREFIX + token)
		if (!valiphone || valiphone !== phone) {
			return UserResponse.createError('token', '验证码错误')
		}
		redis.del(process.env.PHONE_PREFIX + token)
		const user = await em.findOne(User, { phone })
		if (!user) {
			const salt = await bcrypt.genSalt(10)
			let newUser: User
			if (password) {
				const handlePassword = await bcrypt.hash(password, salt)
				newUser = em.create(User, {
					phone: tokenData.phone,
					password: handlePassword,
				})
			} else {
				newUser = em.create(User, { phone: tokenData.phone })
			}
			await em.persistAndFlush(newUser)
			setAuth(req.session, newUser)
			return { user: newUser }
		}
		// await em.persistAndFlush(user)
		setAuth(req.session, user)
		return { user }
	}

	@Query(() => User, { nullable: true })
	async me(@Ctx() { em, req }: Mycontext): Promise<User | null> {
		if (!req.session.userId) {
			return null
		}
		const user = await em.findOne(User, { id: req.session.userId })
		if (!user) {
			return null
		}
		return user
	}
	@Mutation(() => Boolean)
	async logout(@Ctx() { req, res }: Mycontext): Promise<boolean> {
		return new Promise((resolve) => {
			req.session.destroy((err: any) => {
				if (err) {
					console.log(err)
					resolve(false)
					return
				}
				res.clearCookie(process.env.COOKIE_NAME!)
				resolve(true)
			})
		})
	}
}
