import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import { Post } from '../entities/Post'
import { Mycontext } from '../mikro-orm.config'

@Resolver(Post)
export class PostResolver {
	/**
	 * Find all of the params Object and return.`
	 * @param param0
	 * @returns find target Object
	 */
	@Query(() => [Post])
	posts(@Ctx() { em }: Mycontext): Promise<Post[]> {
		return em.find(Post, {})
	}
	/**
	 * Create an Object and flush into the databases.
	 * @param param0
	 * @param title
	 * @returns an Object detail.
	 */
	@Mutation(() => Post)
	async createPost(
		@Ctx() { em, req }: Mycontext,
		@Arg('title') title: String
	): Promise<Post> {
		const post = em.create(Post, { title, creator: req.session.userId })
		await em.persistAndFlush(post)
		return post
	}

	/**
	 * this for update a record.
	 * @param param0
	 * @param id
	 * @param title
	 * @returns a update object.
	 */
	@Mutation(() => Post, { nullable: true })
	async updatePost(
		@Ctx() { em }: Mycontext,
		@Arg('id') id: string,
		@Arg('title', () => String, { nullable: true }) title: string
	): Promise<Post | null> {
		const post1 = await em.findOne(Post, { id })
		if (!post1) {
			return null
		}
		post1.title = title
		await em.persistAndFlush(post1)
		return post1
	}
	/**
	 * For delete an Object.
	 * @param param0
	 * @param id
	 * @returns Boolean
	 */
	@Mutation(() => Boolean)
	async deletePost(@Ctx() { em }: Mycontext, @Arg('id') id: string): Promise<true> {
		await em.nativeDelete(Post, { id })
		return true
	}
}
