import { Arg, Ctx, Mutation, Query, Resolver, UseMiddleware } from 'type-graphql'
import { Post } from '../entities/Post'
import { isAuth } from '../middleware/isAuth'
import { Mycontext } from '../mikro-orm.config'

@Resolver(Post)
export class PostResolver {
	@Query(() => [Post])
	posts(@Ctx() { em }: Mycontext): Promise<Post[]> {
		return em.find(Post, {})
	}

	@UseMiddleware(isAuth())
	@Mutation(() => Post)
	async createPost(
		@Ctx() { em, req }: Mycontext,
		@Arg('title') title: String
	): Promise<Post> {
		const post = em.create(Post, { title, creator: req.session.userId })
		await em.persistAndFlush(post)
		return post
	}

	@UseMiddleware(isAuth())
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

	@UseMiddleware(isAuth())
	@Mutation(() => Boolean)
	async deletePost(
		@Ctx() { em }: Mycontext,
		@Arg('id') id: string
	): Promise<Boolean> {
		await em.nativeDelete(Post, { id })
		return true
	}
}
