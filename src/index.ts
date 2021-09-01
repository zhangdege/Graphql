import { MikroORM } from '@mikro-orm/core'
import { ApolloServer } from 'apollo-server-express'
import connectRedis from 'connect-redis'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import session from 'express-session'
import { RedisPubSub } from 'graphql-redis-subscriptions'
import Redis from 'ioredis'
import path from 'path'
import { buildSchema } from 'type-graphql'
import myMikroconfig from './mikro-orm.config'
import { PostResolver } from './resolvers/post'
import { UserResolve } from './resolvers/user'

dotenv.config({ path: path.join(__dirname, '..', '.env') })

const main = async () => {
	const orm = await MikroORM.init(myMikroconfig)
	const app = express()
	app.set('trust proxy', 1)
	// app.use(cors({
	//   origin:process.env.FRONTEND_URL,
	//   credentials:true
	// }))
	app.use(
		cors({
			credentials: true,
			origin: 'http://localhost:3000',
		})
	)

	const RedisStore = connectRedis(session)
	const options: Redis.RedisOption = {
		host: process.env.REDIS_URL,
		// password: process.env.REDIS_PASSWORD,  //test env Not the pwd
		retryStrategy: (times) => Math.max(times * 100, 3000),
	}
	const redis = new Redis(process.env.REDIS_URL, options)
	const pubSub = new RedisPubSub({
		publisher: new Redis(process.env.REDIS_URL, options),
		subscriber: new Redis(process.env.REDIS_URL, options),
	})

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [PostResolver, UserResolve],
			validate: false,
			pubSub,
		}),
		context: ({ req, res }) => {
			return {
				em: orm.em,
				req,
				res,
				redis,
			}
		},
	})
	/**
	 * App use
	 */
	app.use(
		session({
			name: process.env.COOKIE_NAME,
			store: new RedisStore({ client: redis, disableTouch: true }), // TOUCH 可以延长有效时间 TTL
			cookie: {
				maxAge: 1000 * 60 * 60 * parseInt(process.env.COOKIE_MAXAGE_HOURS!),
				httpOnly: true,
				sameSite: 'lax', // csrf
				secure: process.env.NODE_ENV === 'production',
				// secure: false,
			},
			secret: process.env.REDIS_SECRET,
			saveUninitialized: false,
			resave: false,
		})
	)

	apolloServer.applyMiddleware({ app, cors: false })
	app.use(express.urlencoded({ extended: true }))
	// app.post(process.env.ALIPAY_CB, async (req: Request, res: Response) => {
	//   await alipayCallBack(req, res, orm.em, pubSub)
	// })
	app.all('*', (req, res) => {
		res.redirect('/graphql')
	})
	app.listen(process.env.PORT, () => {
		console.log(`server at http://localhost:${process.env.PORT}`)
	})
}

main()
