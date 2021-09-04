// import { GraphQLUpload } from 'apollo-server-express'
import { createWriteStream } from 'fs'
import { GraphQLUpload } from 'graphql-upload'
import path from 'path'
import { Stream } from 'stream'
import { Arg, Mutation, Resolver } from 'type-graphql'
export interface Upload {
	filename: string
	mimetype: string
	encoding: string
	createReadStream: () => Stream
}
@Resolver()
export class PictureUpload {
	@Mutation(() => Boolean)
	async addPictureFile(
		@Arg('picture', () => GraphQLUpload) { createReadStream, filename }: Upload
	): Promise<boolean> {
		return new Promise(async (resolve, reject) => {
			console.log(123)
			console.log(filename)

			createReadStream()
				.pipe(
					createWriteStream(
						path.join(
							__dirname,
							'..',
							'..',
							'public',
							'images',
							new Date().getTime() + filename
						)
					)
				)
				.on('finish', () => resolve(true))
				.on('error', () => reject(false))
		})
	}
}
