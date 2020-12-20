import Comments from '../model/Comments'
// import Post from '../model/Post'
// import User from '../model/User'
import { checkCode } from '@/common/Utils'
import { getJWTPayload } from '../common/Utils'

class CommentsController {
  // 获取评论列表
  async getComments (ctx) {
    const params = ctx.query
    const tid = params.tid
    const page = params.page ? params.page : 0
    const limit = params.limit ? parseInt(params.limit) : 10
    const result = await Comments.getCommentsList(tid, page, limit)
    const total = await Comments.queryCount(tid)
    ctx.body = {
      code: 200,
      total,
      data: result,
      msg: '查询成功'
    }
  }

  // 添加评论
  async addComment (ctx) {
    const { body } = ctx.request
    const sid = body.sid
    const code = body.code
    // 验证图片验证码的时效性、正确性
    const result = await checkCode(sid, code)
    if (!result) {
      ctx.body = {
        code: 500,
        msg: '图片验证码不正确,请检查！'
      }
      return
    }
    const newComment = new Comments(body)
    const obj = await getJWTPayload(ctx.header.authorization)
    newComment.cuid = obj._id
    const comment = await newComment.save()
    ctx.body = {
      code: 200,
      data: comment,
      msg: '评论成功'
    }
  }

  async updateComment (ctx) {
    const { body } = ctx.request
    const result = await Comments.updateOne({ _id: body.cid }, { $set: body })
    ctx.body = {
      code: 200,
      msg: '修改成功',
      data: result
    }
  }
}

export default new CommentsController()
