// import { GraphQLUpload } from 'apollo-server-express'
import { createWriteStream } from 'fs'
import { GraphQLUpload } from 'graphql-upload'
import path from 'path'
import { Stream } from 'stream'
import { Arg, Ctx, Mutation, Resolver } from 'type-graphql'
import { User } from '../entities/User'
import { Mycontext } from '../mikro-orm.config'
export interface Upload {
	filename: string
	mimetype: string
	encoding: string
	createReadStream: () => Stream
}
@Resolver(User)
export class PictureUpload {
	// @UseMiddleware(isAuth())
	@Mutation(() => Boolean)
	async addPictureFile(
		@Ctx() { em }: Mycontext,
		@Arg('picture', () => GraphQLUpload) { createReadStream, filename }: Upload
	): Promise<boolean> {
		return new Promise(async (resolve, reject) => {
			const nfilename = new Date().getTime() + filename
			createReadStream()
				.pipe(
					createWriteStream(
						path.join(__dirname, '..', '..', 'public', 'images', nfilename)
					)
				)
				.on('finish', async () => {
					resolve(true)
				})
				.on('error', () => reject(false))
		})
	}
}
