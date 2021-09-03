import { MiddlewareFn } from 'type-graphql'
import { Mycontext } from './../mikro-orm.config'

export const isAuth =
	(...roles: string[]): MiddlewareFn<Mycontext> =>
	async ({ context }, next) => {
		const { userId, role } = context.req.session
		if (!userId) {
			throw new Error('not authenticated')
		}
		if (roles.length === 0) {
			console.log('dd')

			return next()
		}

		if (roles.includes(role)) {
			console.log('ok')

			return next()
		}
		throw new Error('not authenticated')
	}
