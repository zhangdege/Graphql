import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql'
import { Post } from '../entities/Post'
import { Mycontext } from '../mikro-orm.config'

@Resolver(Post)
export class PostResolver {
	@Query(() => [Post])
	posts(@Ctx() { em }: Mycontext): Promise<Post[]> {
		return em.find(Post, {})
	}

	@Mutation(() => Post)
	async createPost(
		@Ctx() { em, req }: Mycontext,
		@Arg('title') title: String
	): Promise<Post> {
		const post = em.create(Post, { title, creator: req.session.userId })
		await em.persistAndFlush(post)
		return post
	}

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

	@Mutation(() => Boolean)
	async deletePost(
		@Ctx() { em }: Mycontext,
		@Arg('id') id: string
	): Promise<Boolean> {
		await em.nativeDelete(Post, { id })
		return true
	}
}
