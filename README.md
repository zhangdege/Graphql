# APSU TEMPLATE 
## 一、简介

>这是一套基于NodeJs平台的后台系统模板，主要的技术实现是```TypeScript、ExpressJS、MongoDB、Redis、apollo-server、graphql```。TypeScript是主要语言。

## 二、使用方法
>1.下载（OR）克隆
>```git clone https://github.com/0xchina/apsu-backend.git```
>```cd apsu-backend```
>
>然后使用 yarn 或者 npm 安装依赖：
>
>```yarn```
>
>或者（OR）
>
>```npm install```
>
>(cnpm 也可以)
>
>等待依赖安装结束后即可尝试启动。
>
>```yarn watch  && yarn dev```
>
>或者（OR）
>
>```npm run watch && npm run dev```
>
>**注意**
>
>TypeScript是需要编译的，记得在启动时启用yarn watch进行监听编译.
>
## 三、已经实现的功能

>1.用户功能
>
> - 用户登陆功能
> - 用户注册功能
> - 用户登出功能
>
>2.用户发布功能
>
> - 实现用户Post 增删改查的功能。
>
>3.**Subscription**订阅功能
>
> - 用户可使用订阅功能去实现消息订阅
>
>4.文件上传下载功能
>
> - 用户可上传文件并能提供文件下载

## 四、程序实现过程说明
>(1).```Entity```和```Resolver```
>
>```Entity```是对象实例
>```resolver```是```graphql api```方法
>
>根据```graphql```语法定义相应的```Entity```以及```Resolver```，使```type-graphql``` 
>和```mikro-orm```以及```MongoDB```提供的类型或者修饰器去限定及定义相应的字段。
>
>(2).程序的初始化
>
>定义好```Mikro-orm```配置,在入口文件中使用```MikroORM.init```去初始化```orm```
>在入口文件```index.ts```中使用```expressJS```建立起```http```服务，使用```apollo-server```去初始化```orm```。
>
>(3).初始化```Redis```服务
>
>目前这里使用的是```Redis 5.0.7版本```。结合ExpressJS使用。
>
>

## 五、依赖版本问题及常见问题及处理

> - 该程序使用的是Ubuntu20.04版本操作系统开发。```apollo-server-express```最新版本会报错，致
> 应用不可启动。降级到```apollo-server-express@^2```即可。
> 
> - 在```Subscription```的功能实现需要用到```WebSocket```，```ExpressJS```的服务好像不支持，在该程序中使用了```NodeJS```原生的```http```去实现。



