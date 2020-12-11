import Post from '../model/Post'
class ContentController {
  async getPostList (ctx) {
    const body = ctx.query
    // 测试数据
    // const post = new Post({
    //   title: 'text titel1',
    //   content: 'text content',
    //   catalog: 'advise',
    //   fav: 20,
    //   isEnd: '0',
    //   reads: '0',
    //   answer: '0',
    //   status: '0',
    //   isTop: '0',
    //   sort: '0',
    //   tags: []
    // })
    // const tmp = await post.save()
    // console.log('🚀 ~ file: ContentController.js ~ line 23 ~ ContentController ~ getPostList ~ tmp', tmp)
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
    if (typeof body.status !== 'undefined') {
      options.status = body.status
    }
    if (typeof body.status !== 'undefined') {
      options.isEnd = body.status
    }
    if (typeof body.tag !== 'undefined') {
      options.tags = { $elemMatch: { name: body.tag } }
    }
    const result = await Post.getList(options, sort, page, limit)

    ctx.body = {
      code: 200,
      data: result,
      msg: '获取文章列表成功'
    }
  }
}
export default new ContentController()
