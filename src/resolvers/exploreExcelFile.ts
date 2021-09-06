// import { GraphQLUpload } from 'apollo-server-express'
import { createWriteStream } from 'fs'
import { GraphQLUpload } from 'graphql-upload'
import path from 'path'
import { Stream } from 'stream'
import { Arg, Ctx, Mutation, Resolver, UseMiddleware } from 'type-graphql'
import { User } from '../entities/User'
import { isAuth } from '../middleware/isAuth'
import { Mycontext } from '../mikro-orm.config'
import { readXslxFile } from '../utils/fileOperator'
export interface Upload {
	filename: string
	mimetype: string
	encoding: string
	createReadStream: () => Stream
}
@Resolver(User)
export class DataFromExcel {
	@UseMiddleware(isAuth())
	@Mutation(() => Boolean)
	async addExcelFile(
		@Ctx() { em }: Mycontext,
		@Arg('Excel', () => GraphQLUpload) { createReadStream, filename }: Upload
	): Promise<boolean> {
		return new Promise(async (resolve, reject) => {
			createReadStream()
				.pipe(
					createWriteStream(
						path.join(__dirname, '..', '..', 'public', 'data', filename)
					)
				)
				.on('finish', async () => {
					const datas = readXslxFile(filename)
					const users = datas.map((user: any) => {
						return em.create(User, { ...user })
					})

					await em.persistAndFlush(users)
					resolve(true)
				})
				.on('error', () => reject(false))
		})
	}
}
