import {
	Arg,
	Ctx,
	FieldResolver,
	Mutation,
	Query,
	Resolver,
	Root,
	UseMiddleware,
} from 'type-graphql'
import { Post } from '../entities/Post'
import { User } from '../entities/User'
import { isAuth } from '../middleware/isAuth'
import { Mycontext } from '../mikro-orm.config'

@Resolver(Post)
export class PostResolver {
	@FieldResolver(() => User)
	creator(@Root() post: Post, @Ctx() { em }: Mycontext): Promise<User | null> {
		return em.findOne(User, { id: post.creator.id })
	}

	@Query(() => [Post])
	posts(@Ctx() { em }: Mycontext): Promise<Post[]> {
		return em.find(Post, {})
	}

	@Query(() => Post, { nullable: true })
	post(
		@Ctx() { em }: Mycontext,
		@Arg('id', () => String) id: string
	): Promise<Post | null> {
		return em.findOne(Post, { id })
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
