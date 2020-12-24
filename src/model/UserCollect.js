import moogoose from '../config/DBHelpler'
import moment from 'dayjs'

const Schema = moogoose.Schema

const UserCollectSchema = new Schema({
  uid: { type: String },
  tid: { type: String },
  title: { type: String },
  created: { type: Date }
})

UserCollectSchema.pre('save', function (next) {
  this.created = moment().format('YYYY-MM-DD HH:mm:ss')
  next()
})

UserCollectSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('There was a duplicate key error'))
  } else {
    next(error)
  }
})

UserCollectSchema.statics = {
  // 查询总数
  queryCollectCount: function (options) {
    return this.find(options).countDocuments()
  },
  // 查询特定用户的收藏数据
  queryCollectByUserId: function (uid, limit, page) {
    return this.find({ uid: uid })
      .limit(limit)
      .skip(limit * page)
      .sort(['created', -1])
  }
}

const UserCollect = moogoose.model('user_collect', UserCollectSchema)

export default UserCollect
