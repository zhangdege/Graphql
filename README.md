# 后台系统

## 服务端

### 工作内容

工作流程 :根据数据库表将数据库表变成数据库代码，变成数据库代码后将它应有的数据库关系映射上去，然后书写它的方法（增删改查方法），将方法封装在API接口中。这是一部分，在另一部分数据搜索中，将es(ElasticSearch)的数据也加进去。同样会有同步的方法去将数据库的数据同步到es中，方便使用。

上面说到的增删改查方法包括数据库表中的十三个表的实例对对象的增删改查方法以及逻辑的确认验证。

书写完成的方法大多数已经通过自己测试验证。

开发文档：

> ### entities
>
>> 所有的entities存在于/src/entities下
>>
>> 所有实例都按照已有表写好。
>>
>
> #### ManyToOne、ManyToMany和OneToMany
>
>> ManyToOne在Device中要注意返回值使用数组。
>>
>> 在OneToMany中注意要写上()=>Entity
>>
>
> 在所有的实例中，推荐只要是有关联的，双方应该要能查到所有的相互的数据。
>
> ### 进度Resolver
>
> #### resolvers
>
>> 所有的所有的resolver存在于/src/resolvers下
>>
>
> #### 用户模块
>
>> resolver文件：/resolvers/user.ts
>>
>> 1、用户注册或者登陆方法 `phoneLoginOrRegister`，需要参数：手机号和验证码！发送验证码，前端需要调用 `sendToken`,传递的参数phone。
>>
>> 2、用户注册登陆成功，查看用户名下是否有公司（返回的结果有信息），如果没有，需要让用户选择加入公司或者创建公司。如果申请加入，使用 `userApplyJoinIntoCompany`，参数需要CompanyId。如果创建，需要调用 `createCompany`，参数需要是CompanyName。
>>
>> 注意：假如是创建公司，他的身份就是admin（管理员），否则就是user（普通会员）。
>>
>> 管理员有权限将用户加入某一个由公司创建的用户组。否则就是需要申请加入某一用户组（需要订阅消息或者站内信......,未完成）。
>>
>> 公司，用户选择加入的话，跟加入组是一样的。需要申请加入（订阅功能尚未完成...站内信）。
>>
>> 方法索引:
>>
>> Query:
>>
>> `getUsers`():没有参数,是role为admin的管理员获取用户列表用的。
>>
>> `me`():无参数，查询已登录的用户信息。
>>
>> Mutation:
>>
>> `sendToken`({phone}):有参数，参数为手机,获取验证码。
>>
>> `phoneLoginOrRegister`({phone,token}):手机号和验证码，登陆、注册，存在为登陆，否则登陆。
>>
>> `loginWithPassword`({phone,password})：手机号和密码，登陆。
>>
>> `logout`()：无需参数，用户退出本站。
>>
>> `refreshToken`({`refreshToken`}})：需要参数 `refreshToken`,刷新口令。
>>
>> `userModifyPassword`({phone,token,password}):手机号，验证码，新密码。功能修改密码。
>>
>
> ##### 用户和公司之间的关系处理方法
>
>> Resolver文件：/resolvers/userAndCompany.ts，此文件下所有方法均为Mutation
>>
>> 用户申请加入公司(基本流程已经完成)
>>
>> `userAgreeJoinCompany`(companyId:string)：参数是
>>
>> 管理员同意用户加入已完成
>>
>> `adminAgreeAgreeUserJoinOurCompany`(userId:string)
>>
>> 管理员邀请用户加入已完成
>>
>> `adminInviteUser`(phone:string)
>>
>> 用户同意加入已完成
>>
>> `userAgreeJoinCompany`(companyId)
>>
>> 管理员将公司成员从公司中删除
>>
>> `deleteUserFromCompany`([UserId])
>>
>> 上面已经完成的状态，消息队列未存在，未存在通知
>>
>
> ##### 用户组模块
>
>> Resolver文件：/resolvers/userGroup.ts
>>
>> 目前进度:
>>
>> Query：
>>
>> `getUserGroupById`({id})，需要提供需要查询的用户组id查询用户组。
>>
>> `getUserGroups`()，不需要参数，需要登陆。查询所有用户组。
>>
>> Mutation:
>>
>> `createUserGroup`({data:{name}})，需要提供用户组的名字。需登陆下操作。
>>
>> `destroyUserGroup`({id})根据id删除用户组
>>
>
> #### 公司模块
>
>> resolver文件:/resolvers/company.ts
>>
>> Query:
>>
>> `getCompanyById`(id):需要公司id查询。需要登陆
>>
>> `getCompanies`()：无需参数，需要登陆(管理员)
>>
>> Mutation:
>>
>> `createCompany`({name}):创建公司，需要参数，参数是公司名。
>>
>> `destroyCompany({id:""}),需要的参数是公司id，用户必须是管理员，然后进行注销操作。`
>>
>> **Elastic search**
>>
>> 添加了elastic search，所有搜索都有
>>
>
> #### 设备模块
>
>> resolver文件：/resolvers/device.ts
>>
>> 目前进度：
>>
>> Query:
>>
>> `getDevices`(),查询所有设备，需要登陆。
>>
>> Mutation:
>>
>> `1.createDevice({productId,edgeId,data:{status,firmware,deviceId,mqttUsername,mqttPassword}}):需要参数，所属产品的产品ID，所属边缘设备的一个边缘设备ID，还需要它本身的一些属性值，status，firmware，status是目前状态，三元组deviceId,mqttUsername,mqttPassword，状态有online、offline、new，firware固件。需要登陆。`
>>
>> `2.destroyDevice({id:""}),需要参数，参数为要删除的设备id，返回结果为Boolean`
>>
>
> ##### 设备和设备组
>
>> resolver文件/resolvers/deviceAndDeviceGroupdeviceGroup.ts
>>
>> ### Mutation：
>>
>> `1.addDeviceIntoDeviceGroup({groupId:"",deviceIds:[]}),添加设备到设备组，参数需要有目标设备组的id和设备id组，设备id组是一组设备id（数组），返回结果是成功加入的设备信息。`
>>
>> `2.deleteDeviceFromDeviceGroup({groupId:"",deviceId:""}),从设备组删除设备，需要的参数是设备id和设备设备组id，设备组id作用是需要验证这个组是否存在，不能一点击就将设备离组。`
>>
>
> ##### 设备组模块
>
>> resolver文件/resolvers/deviceGroup.ts
>>
>> 目前进度:
>>
>> Query:
>>
>> `getDeviceGroups`()，需要登陆，获取所有设备
>>
>> Mutation:
>>
>> `createDeviceGroup`({productId,data:{name}}})：需要参数，参数需要有所属产品的产品id，和本身的属性name。需要登陆。
>>
>> `deleteDeviceGroup`({id})根据id删除设备组
>>
>
> #### 边缘模块
>
>> resolver文件/resolvers/edge.ts
>>
>> 目前进度：
>>
>> Query:
>>
>> `getEdges`()获取所有边缘设备，需要登陆，无需参数
>>
>> Mutation：
>>
>> `createEdge`({data:{firmware,picture,deviceId,mqttUsername,mqttPassword}}):创建边缘，需要参数，参数包括固件版本和图片以及mqttname和密码。需要登陆。
>>
>> `destroyEdge`({id})删除边缘,需要登陆，需要提供要删除的id
>>
>
> #### 事件模块
>
>> resolver文件/resolvers/event.ts
>>
>> 目前进度:
>>
>> Query:
>>
>> `getEvents`() 要登陆，获取事件
>>
>> Mutation:
>>
>> `createEvents`({`productId`,`functionId`,data:{`limit`:number,`condition`}})创建事件需要参数，参数含义：所处产品id，所属功能id，自身的属性limit，condition，noticeby。需要登陆。
>>
>> `destroyEvent`({id})删除事件，需要事件的id，需要登陆
>>
>
> #### 固件模块
>
>> resolver文件/resolvers/firmware.ts
>>
>> 目前进度:
>>
>> Query:
>>
>> `getFirmwares`()无需参数，获取全部固件，需要登陆
>>
>> Mutation:
>>
>> `createFirmware`({data:{version,oss,description}})创建固件需要自身属性参数，固件版本，描述，oss地址。
>>
>> `destroyFirmware`({id}),删除firmware，需要登陆，需要id
>>
>
> #### 日志模块
>
>> resolver文件/resolvers/log.ts
>>
>> 目前进度:
>>
>> Query:
>>
>> `getLogs`()需要登陆，获取所有的Logs
>>
>> Mutation:
>>
>> `createLog`({`productId,edgeId`,`data`:{`payload`}})需要参数，需要登陆。
>>
>> `deleteLog`({id})根据id删除log
>>
>
> #### Model模块
>
>> resolver文件/resolvers/model.ts
>>
>> 目前进度:
>>
>> Query:
>>
>> `getModels`()需要登陆，无需参数，获取全部Model
>>
>> Mutation:
>>
>> `createModel`({data:{name,initCode}})需要参数，需要登陆。
>>
>> `deleteModel`({id})根据id删除Model
>>
>
> #### 产品模块
>
>> resolver文件/resolvers/product.ts
>>
>> 目前进度:
>>
>> Query:
>>
>> `getProducts`()获取所有产品
>>
>> Mutation:
>>
>> `createProduct`(`modelId`,data:{name,img,description})创建产品，加入产品组。还需要自身属性。
>>
>> `deleteProduct`({id})根据id删除产品
>>
>
> ##### 产品组模块
>
>> resolver文件/resolvers/productGroup.ts
>>
>> 目前进度:
>>
>> Qeury:
>>
>> `getProductGroupById`({id})：需要提供要查找的产品id
>>
>> `getProductions`()：无需参数，查询所有的产品。
>>
>> Mutation：
>>
>> `createProductGroup`({name})，新需要提供产品组名称，以及登陆状态。
>>
>
> #### 功能模块
>
>> resolver文件/resolvers/topic.ts
>>
>> 目前进度:
>>
>> Query:
>>
>> `getTopics`()获取所有功能方法
>>
>> mutation:
>>
>> `createTopic`({`productId`,`data`:{`access`,`icon`}})，需要参数，需要提供所属的产品id，以及自身的data，access,以及icon。
>>
>> `destroyTopic`({id})根据id删除Topic
>>
>
> ### 关于ElasticSearch的问题及解决方案
>
>> 1.在ElasticSearch中需要去更改mapping的问题。
>>
>> 解决方案就是：重新加一个index，重构好新的index的mapping，再去做_reindex将老的index数据复制到新的index上。案例如下：
>>
>> 案例：
>>
>> 现如今我拥有一个叫做article的index，他现在有9条数据。它的mapping如下:
>>
>> ```json
>> {
>>   "articles" : {
>>     "mappings" : {
>>       "properties" : {
>>         "content" : {
>>           "type" : "text",
>>           "analyzer" : "ik_max_word"
>>         },
>>         "createdAt" : {
>>           "type" : "date"
>>         },
>>         "id" : {
>>           "type" : "text"
>>         },
>>         "img" : {
>>           "type" : "text"
>>         },
>>         "name" : {
>>           "type" : "text",
>>           "analyzer" : "ik_max_word"
>>         },
>>         "sign" : {
>>           "type" : "text",
>>           "analyzer" : "ik_max_word"
>>         },
>>         "time" : {
>>           "type" : "date"
>>         },
>>         "updatedAt" : {
>>           "type" : "date"
>>         },
>>         "video" : {
>>           "type" : "text"
>>         }
>>       }
>>     }
>>   }
>> }
>>
>>
>> ```
>>
>> 现在我需要将article的mapping转换成：
>>
>> ```json
>> ```json
>> {
>>   "articles" : {
>>     "mappings" : {
>>       "properties" : {
>>         "content" : {
>>           "type" : "text",
>>           "analyzer" : "ik_max_word"
>>         },
>>         "createdAt" : {
>>           "type" : "date"
>>         },
>>         "id" : {
>>           "type" : "text"
>>         },
>>         "img" : {
>>           "type" : "text"
>>         },
>>         "name" : {
>>           "type" : "text",
>>           "analyzer" : "ik_max_word"
>>         },
>>         "sign" : {
>>           "type" : "text"
>>         },
>>         "time" : {
>>           "type" : "date"
>>         },
>>         "updatedAt" : {
>>           "type" : "date"
>>         },
>>         "video" : {
>>           "type" : "text"
>>         }
>>       }
>>     }
>>   }
>> }
>>
>>
>> ```
>>
>> 我需要做的事情就是新建一个新的index叫做articles，把它的mapping设置成
>>
>> ```json
>> ```json
>> {
>>   "articles" : {
>>     "mappings" : {
>>       "properties" : {
>>         "content" : {
>>           "type" : "text",
>>           "analyzer" : "ik_max_word"
>>         },
>>         "createdAt" : {
>>           "type" : "date"
>>         },
>>         "id" : {
>>           "type" : "text"
>>         },
>>         "img" : {
>>           "type" : "text"
>>         },
>>         "name" : {
>>           "type" : "text",
>>           "analyzer" : "ik_max_word"
>>         },
>>         "sign" : {
>>           "type" : "text"
>>         },
>>         "time" : {
>>           "type" : "date"
>>         },
>>         "updatedAt" : {
>>           "type" : "date"
>>         },
>>         "video" : {
>>           "type" : "text"
>>         }
>>       }
>>     }
>>   }
>> }
>>
>>
>>
>>
>> ```
>>
>> 然后reindex把article的数据复制到articles上。
>>
>> ```bash
>> POST _reindex
>> {
>> "source": {
>> "index": "article"
>> },
>> "dest": {
>> "index": "articles"
>> }
>> }
>> ```
>>
>> 执行完万上面操作后就可以将article删除了。
>>
>> ```bash
>> DELETE article
>> ```
>>
>> 再次执行完毕之后就更改新的index，articles的别名为article：
>>
>> 操作如下
>>
>> ```bash
>> POST /_aliases
>> {
>>   "actions" : [
>>         { "add" : { "index" : "articles", "alias" : "article" } }
>>     ]
>> }
>> ```
>>
>> 这样就是能无损替换mapping了。
>>
>
> #### ES的同步数据接口和初始化Index
>
>> `#文件在/src/resolvers/ourESInitializeIndex.ts和/src/resolvers/ES文件夹
>>
>> 文件ourESInitializeIndex.ts中存着初始化同步数据的方法。这个文件中包含着两个方法：`1.esInitializedIndex`()不需要参数，作用是初始化所有相对应的Entity在ES的Index,带着自定义的设置。自定义设置在同文件夹中的./ES/Mapping下。自定义的设置有aliases和setting以及mapping。
>>
>> `2.esInitializedIndexData()不需要参数，将现有的entity的data同步到对应的Index中。`
>>

技术：

> 主要技术包含Nodejs的网络框架expressJS以及appoloServer和mikro-orm，redis和Mongodb以及Elastic-Search，graphql，TypeScript等技术。
> Express的作用是提供服务的基础。Mongo则是数据持久化的方案，Elastic-Search是作为附属数据库，数据存储到数据库后也会有相应的数据同步到Elastic-Search，它的>>作用主要是做搜索引擎，给搜索时带来更好的性能体验。
> 具体的模块功能详情请查看"开发文档.md"

> 说明：
> 在安全方面我们有着一套完备的验证系统。
> 支付接口也对接了支付宝及微信。//此系统中暂未调用到
> 数据的操作方面也相对完备。增删改查样样具备。
> 在数据服务的支持下使用了Graphql对接Web客户端，性能及易用性上有着质的飞跃，GraphqlAPI不同于resfulAPI，它可以更方便的管理及增加或者修改API接口，不用再对各个路径进行对应的专门管理。

# 客户端

## 工作内容

> #app 全局布局以及处理全局状态。
> 基本完成全局基本布局以及全局数据的布局工作。
>
> 详细：为系统提供全局状态管理全局变环境，有了全局状态管理，使用Nextjs的Context实现。他的作用就是存放全局状态及更改全局状态的方法，这样使得开发效率得到极大的提升。全局布局就是在应用的公共部分抽出来，作为应用的同样布局。
>
> 在系统中是头部状态和侧边导航栏。中间的为页面。主要就是将头部导航栏及侧边导航栏抽出来作为全局的形态。根据路由去匹配相应的路径和页面。

说明：
技术：Next.js，typeScript
