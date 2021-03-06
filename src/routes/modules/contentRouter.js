import Router from 'koa-router'
import contentController from '@/api/ContentController'

const router = new Router()

router.prefix('/content')

// 上传图片
router.post('/upload', contentController.uploadImg)

// 发表新贴
router.post('/add', contentController.addPost)

// 更新帖子
router.post('/update', contentController.updatePost)

router.post('/update-id', contentController.updatePostByTid)

// 删除帖子
router.get('/delete', contentController.deletePost)

export default router
