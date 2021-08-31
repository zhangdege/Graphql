import { User } from '../entities/User'
import { Mycontext } from './../mikro-orm.config'

export const setAuth = (session: Mycontext['req']['session'], user: User) => {
	// console.log(session, user)
	session.userId = user.id
	session.role = user.role
}
