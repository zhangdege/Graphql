import { MikroORM } from "@mikro-orm/core";
import dotenv from "dotenv";
import path from "path";
import { Post } from "./entities/Post";
// const app = express()

// app.use(express.json())

dotenv.config({path:path.join(__dirname,'..','.env')})

// app.get('/',(req,res)=>{
//   res.json({status:'success',code:200,message:'Complete!'})
// })
const main = async ()=>{
  
  const orm = await MikroORM.init({
    entities: [Post],
    type: 'mongo', // one of `mongo` | `mysql` | `mariadb` | `postgresql` | `sqlite`
    clientUrl:process.env.MONGODB, // defaults to 'mongodb://localhost:27017' for mongodb driver
  })
  const posts = orm.em.create(Post,{title:'zhang'})
  
  await orm.em.persistAndFlush(posts)
  
  setTimeout(async ()=>{
    const f = await orm.em.find(Post,{});
    console.log(f);
  },2000)
}

main()
// const PORT = process.env.PORT || 3000
// app.listen(PORT)