import mongoose from '../config/DBHelpler'
import moment from 'dayjs'

const Schema = mongoose.Schema

const CommentsSchema = new Schema({
  tid: { type: String, ref: 'post' },
  cuid: { type: String, ref: 'users' },
  content: { type: String },
  created: { type: Date },
  hands: { type: Number, default: 0 }, // 点赞数量
  status: { type: String, default: '1' },
  isRead: { type: String, default: '0' },
  isBest: { type: String, default: '0' }// 是否采纳0-否，1-是
})

CommentsSchema.pre('save', function (next) {
  this.created = moment().format('YYYY-MM-DD HH:mm:ss')
  next()
})

CommentsSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('There was a duplicate key error'))
  } else {
    next(error)
  }
})

CommentsSchema.statics = {
  findByTid: function (id) {
    return this.find({ tid: id })
  },
  findByCid: function (id) {
    return this.find({ cid: id })
  },
  getCommentsList: function (id, page, limit) {
    return this.find({ tid: id }).populate({
      path: 'cuid',
      select: '_id name pic isVip',
      match: { status: { $eq: '0' } }
    }).populate({
      path: 'tid',
      select: '_id title status'
    }).skip(page * limit).limit(limit)
  },
  queryCount: function (id) {
    return this.find({ tid: id }).countDocuments()
  }
}

const Comments = mongoose.model('comments', CommentsSchema)

export default Comments
