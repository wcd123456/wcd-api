import Comments from '../model/Comments'
import Post from '../model/Post'
import User from '../model/User'
import { checkCode } from '@/common/Utils'
import { getJWTPayload } from '../common/Utils'
const canReply = async (ctx) => {
  let result = false
  const obj = await getJWTPayload(ctx.header.authorization)
  if (typeof obj === 'undefined') {
    return result
  } else {
    const user = await User.findByID(obj._id)
    // 为0时没有被禁言
    if (user.status === '0') {
      result = true
    }
    return result
  }
}
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
    const check = await canReply(ctx)
    if (!check) {
      ctx.body = {
        code: 500,
        msg: '用户已经被禁言'
      }
      return
    }
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
    const check = await canReply(ctx)
    if (!check) {
      ctx.body = {
        code: 500,
        msg: '用户已经被禁言'
      }
      return
    }
    const { body } = ctx.request
    const result = await Comments.updateOne({ _id: body.cid }, { $set: body })
    ctx.body = {
      code: 200,
      msg: '修改成功',
      data: result
    }
  }

  async setBest (ctx) {
    // 对用户的权限进行判断
    const obj = await getJWTPayload(ctx.header.authorization)
    if (typeof obj === 'undefined' && obj._id === '') {
      ctx.body = {
        code: 500,
        msg: '用户未登陆或者用户未授权'
      }
      return
    }
    const params = ctx.query
    const post = await Post.findOne({ _id: params.tid })
    if (post.uid === obj._id && post.isEnd === '0') {
      // 说明是作者本人，可以设置
      const result = await Post.updateOne({ _id: params.tid }, { $set: { isEnd: '1' } })
      const result1 = await Comments.updateOne({ _id: params.cid }, { $set: { isBest: '1' } })
      if (result.ok === 1 && result1.ok === 1) {
        // 把积分值给采纳用户
        const comment = Comments.findByCid(params.cid)
        const result2 = await User.updateOne({ _id: comment.cuid }, { $inc: { favs: parseInt(post.fav) } })
        if (result2.ok === 1) {
          ctx.body = {
            code: 200,
            msg: '设置成功',
            data: result2
          }
        } else {
          ctx.body = {
            code: 200,
            msg: '设置最佳答案-更新用户失败'
          }
        }
      } else {
        ctx.body = {
          code: 500,
          msg: '设置设备',
          data: { ...result, ...result1 }
        }
      }
    } else {
      ctx.body = {
        code: 500,
        msg: '帖子已经结贴，无法重复设置'
      }
    }
  }
}

export default new CommentsController()
