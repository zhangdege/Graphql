import { ClassType, Ctx, Query, Resolver } from 'type-graphql'
import { Middleware } from 'type-graphql/dist/interfaces/Middleware'
import { User } from '../entities/User'
import { EntityName, Mycontext } from '../mikro-orm.config'

const SchemaResolvergenerator = <T extends ClassType, X extends ClassType>(
	suffix: string,
	returnType: T,
	entityName: EntityName,
	InputType?: X,
	middleware?: Middleware<Mycontext>[],
	creatorKeyName?: string
): any => {
	@Resolver()
	class BaseResolver {
		@Query(() => [returnType], { name: `user${suffix}s` })
		async queryUsers(@Ctx() { em }: Mycontext) {
			return em.find(entityName, {})
		}
	}
	console.log(typeof BaseResolver)

	return BaseResolver
}

const usersTestResolver = SchemaResolvergenerator('use', User, 'User')

export { usersTestResolver }
