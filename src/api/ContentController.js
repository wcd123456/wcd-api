import Post from '../model/Post'
import Links from '../model/Links'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import moment from 'dayjs'
import config from '@/config'
// method1
// import { dirExists } from '@/common/Utils'
// method2
import mkdir from 'make-dir'
class ContentController {
  // 获取文章列表
  async getPostList (ctx) {
    const body = ctx.query

    const sort = body.sort ? body.sort : 'created'
    const page = body.page ? parseInt(body.page) : 0
    const limit = body.limit ? parseInt(body.limit) : 20
    const options = {}

    if (typeof body.catalog !== 'undefined' && body.catalog !== '') {
      options.catalog = body.catalog
    }
    if (typeof body.isTop !== 'undefined') {
      options.isTop = body.isTop
    }
    if (typeof body.status !== 'undefined' && body.status !== '') {
      options.isEnd = body.status
    }
    if (typeof body.tag !== 'undefined' && body.tag !== '') {
      options.tags = { $elemMatch: { name: body.tag } }
    }
    const result = await Post.getList(options, sort, page, limit)

    ctx.body = {
      code: 200,
      data: result,
      msg: '获取文章列表成功'
    }
  }

  // 查询友链
  async getLinks (ctx) {
    const result = await Links.find({ type: 'links' })
    ctx.body = {
      code: 200,
      data: result
    }
  }

  // 查询温馨提醒
  async getTips (ctx) {
    const result = await Links.find({ type: 'tips' })
    ctx.body = {
      code: 200,
      data: result
    }
  }

  // 本周热议
  async getTopWeek (ctx) {
    const result = await Post.getTopWeek()
    ctx.body = {
      code: 200,
      data: result
    }
  }

  // 上传图片
  async uploadImg (ctx) {
    const file = ctx.request.files.file
    // 图片名称，图片格式，图片存储位置，返回前台可以读取路径
    const ext = file.name.split('.').pop()// 获取文件后缀
    const dir = `${config.uploadPath}/${moment().format('YYYYMMDD')}`
    // 判断路径是否存在，不存在则创建
    await mkdir(dir)
    // 存储文件到指定的路径
    // 给文件一个唯一的名称
    const picname = uuidv4()
    const destPath = `${dir}/${picname}.${ext}`
    // 一次读取1k
    // const reader = fs.createReadStream(file.path, { highWaterMark: 1 * 1024 })
    // 默认读取64k
    const reader = fs.createReadStream(file.path)
    const upStream = fs.createWriteStream(destPath)
    const filePath = `/${moment().format('YYYYMMDD')}/${picname}.${ext}`
    // method1适合简单的小文件上传
    reader.pipe(upStream)

    // method2适合大文件上传
    // 读取文件长度
    // const stat = fs.statSync(file.path)
    // console.log('🚀 ~ file: ContentController.js ~ line 87 ~ ContentController ~ uploadImg ~ stat', stat.size)
    // let totalLenght = 0
    // reader.on('data', (chunk) => {
    //   totalLenght += chunk.length
    //   console.log('🚀 ~ file: ContentController.js ~ line 89 ~ ContentController ~ uploadImg ~ totalLenght', totalLenght)
    //   if (upStream.write(chunk) === false) {
    //     reader.pause()
    //   }
    // })
    // reader.on('drain', () => {
    //   reader.resume()
    // })
    // reader.on('end', () => {
    //   upStream.end()
    // })
    ctx.body = {
      code: 200,
      msg: '图片上传成功',
      data: filePath
    }
  }
}

export default new ContentController()
