import dotenv from "dotenv"
import path from 'path'
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Resolver } from 'type-graphql'
import { User } from '../entities/User'
import { Mycontext } from '../mikro-orm.config'

dotenv.config({path:path.join(__dirname,'..','.env')})

/**
 * 
 */
@InputType()
class PhonePasswordInput {
	@Field()
	phone: string
	@Field()
	password: string
}
/**
 * 
 */
@ObjectType()
export class FieldError {
	@Field()
	field: string
	@Field()
	message: string
}

/**
 * 
 */
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

  /**
  * 
  */
  @Resolver(User)
  export class UserResolve{
    @Mutation(() => UserResponse)
	async sendToken(
		@Arg('phone') phone: string,
		@Ctx() { redis }: Mycontext
	): Promise<UserResponse> {
		const token = '2' + Math.random().toString().slice(-5)
		const toShort = await redis.get(process.env.PHONE_TOKEN_AT_TIME_PREFIX + phone)
		// if (toShort && process.env.NODE_ENV === 'production') {
		if (toShort) {
			return UserResponse.createError('phone', '发送太频繁')
		}
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
		// await sendSMSToken({ phone, smsToken: token })
		return UserResponse.createError('phone', '发送成功')
	}

}

