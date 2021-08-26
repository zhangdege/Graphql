import { Connection, EntityManager, IDatabaseDriver, MikroORM } from '@mikro-orm/core'
import { TsMorphMetadataProvider } from "@mikro-orm/reflection"
import dotenv from "dotenv"
import { Redis } from 'ioredis'
// import {Request,Response} from "express"
import path from "path"
import { Post } from "./entities/Post"
import { User } from "./entities/User"

dotenv.config({path:path.join(__dirname,'..','.env')})

export const entities = [Post,User]
const EntityName = ['Post',"User"] as const

// I don't underStand why to write it ,because Although I am delete it , the program is work in normal.
export type Items = typeof entities[number]
export type ItemInstance = InstanceType<Items>
export type EntityName = typeof EntityName[number]
export type Mycontext = {
	em: EntityManager<IDatabaseDriver<Connection>>,
  redis: Redis
}
export default {
  metadataProvider:TsMorphMetadataProvider,
  type: 'mongo',
  clientUrl:process.env.MONGODB_URL,
  entities,
  debug:true
} as Parameters<typeof MikroORM.init>[0]