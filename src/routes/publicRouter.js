import Router from 'koa-router'
import publicController from '../api/PublicController'
import ContentController from '../api/ContentController'

const router = new Router()

router.prefix('/public')

router.get('/getCaptcha', publicController.getCaptcha)
router.get('/list', ContentController.getPostList)

export default router
