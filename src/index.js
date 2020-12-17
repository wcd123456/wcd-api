import Koa from 'koa'
import JWT from 'koa-jwt'
import path from 'path'
import helmet from 'koa-helmet'
import statics from 'koa-static'
import router from './routes/routes'
import koaBody from 'koa-body'
import jsonutil from 'koa-json'
import cors from '@koa/cors'
import compose from 'koa-compose'
import compress from 'koa-compress'
import config from './config/index'
import errorHandle from './common/ErrorHandle'

const app = new Koa()

const isDevMode = process.env.NODE_ENV !== 'production'

// 定义公共路径，不需要jwt鉴权
const jwt = JWT({ secret: config.JWT_SECRET }).unless({ path: [/^\/public/, /^\/login/] })

/**
 * 使用koa-compose 集成中间件
 */
const middleware = compose([
  koaBody({
    multipart: true, // 是否支持文件上传，默认false
    formidable: {
      keepExtensions: true, // 是否保留后缀
      maxFiledsSize: 5 * 1024 * 1024// 上传图片大小,最大5M
    },
    onError: (err) => {
      console.log('🚀 ~ file: index.js ~ line 33 ~ err', err)
    }
  }),
  statics(path.join(__dirname, '../public')),
  cors(),
  jsonutil({ pretty: false, param: 'pretty' }),
  helmet(),
  errorHandle,
  jwt
])

if (!isDevMode) {
  app.use(compress())
}

app.use(middleware)
app.use(router())

app.listen(3000)
