import Router from 'koa-router'
import userController from '../../api/UserController'

const router = new Router()

router.prefix('/user')

// 用户签到
router.get('/fav', userController.userSign)

// 更新用户的基本信息
router.post('/basic', userController.updateUserInfo)

// 更新用户的账号
router.get('/updatename', userController.updateUsername)

// 修改密码
router.post('/change-password', userController.changePasswd)

// 设置收藏
router.get('/set-collect', userController.setCollect)

// 获取收藏列表
// router.get('/get-collect', userController.getCollect)

export default router
