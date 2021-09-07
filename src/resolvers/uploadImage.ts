import { createWriteStream } from 'fs'
import { GraphQLUpload } from 'graphql-upload'
import path from 'path'
import { Stream } from 'stream'
import { Arg, Mutation, Resolver, UseMiddleware } from 'type-graphql'
import { User } from '../entities/User'
import { isAuth } from '../middleware/isAuth'
export interface Upload {
	filename: string
	mimetype: string
	encoding: string
	createReadStream: () => Stream
}
@Resolver(User)
export class PictureUpload {
	@UseMiddleware(isAuth())
	@Mutation(() => Boolean)
	async addPictureFile(
		@Arg('picture', () => GraphQLUpload)
		{ createReadStream, filename, mimetype, encoding }: Upload
	): Promise<Boolean> {
		return new Promise(async (resolve, reject) => {
			createReadStream()
				.pipe(
					createWriteStream(
						path.join(__dirname, '..', '..', 'public', 'images', filename)
					)
				)
				.on('finish', async () => {
					resolve(true)
				})
				.on('error', () => {
					reject(false)
				})
		})
	}
}
