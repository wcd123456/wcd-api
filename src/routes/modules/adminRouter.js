import Router from 'koa-router'
import contentController from '@/api/ContentController'
import userController from '@/api/UserController'

const router = new Router()

router.prefix('/admin')

// 标签页面
// 获取标签列表
router.get('/get-tags', contentController.getTags)

// 添加标签
router.post('/add-tag', contentController.addTag)

// 删除标签
router.get('/remove-tag', contentController.removeTag)

// 编辑标签
router.post('/edit-tag', contentController.updateTag)

// 用户管理
// 查询所有用户
router.get('/users', userController.getUsers)

// 删除
router.post('/delete-user', userController.deleteUserById)

// 更新特定用户
router.post('/update-user', userController.updateUserById)

router.post('/update-user-settings', userController.updateUserBatch)

// 添加用户
router.post('/add-user', userController.addUser)

// 校验用户名是否冲突
router.get('/checkname', userController.checkUsername)

export default router
