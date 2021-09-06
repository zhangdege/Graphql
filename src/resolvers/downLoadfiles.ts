import { Arg, Ctx, Mutation, Resolver } from 'type-graphql'
import { User } from '../entities/User'
import { Mycontext } from '../mikro-orm.config'

@Resolver()
export class DownloadFiles {
	@Mutation(() => String)
	async createExcelFiles(
		@Ctx() { em }: Mycontext,
		@Arg('groupInfo', () => [String]) groupInfo: string[]
	): Promise<string> {
		return new Promise((resolve, reject) => {
			const datas = em.find(User, { id: { $in: groupInfo } })
			console.log(datas)
		})
	}
}
