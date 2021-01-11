import mongoose from '../config/DBHelpler'
import moment from 'dayjs'

const Schema = mongoose.Schema

const CommentsSchema = new Schema({
  tid: { type: String, ref: 'post' },
  uid: { type: String, ref: 'users' },
  cuid: { type: String, ref: 'users' },
  content: { type: String },
  created: { type: Date },
  hands: { type: Number, default: 0 },
  status: { type: String, default: '1' },
  isRead: { type: String, default: '0' },
  isBest: { type: String, default: '0' }
}, { toJSON: { virtuals: true } })

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
    return this.findOne({ _id: id })
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
  },
  getCommetsPublic: function (id, page, limit) {
    return this.find({ cuid: id })
      .populate({
        path: 'tid',
        select: '_id title'
      })
      .skip(page * limit)
      .limit(limit)
      .sort({ created: -1 })
  },
  // 第二种方法
  getMsgList: function (id, page, limit) {
    return this.find({
      uid: id,
      cuid: { $ne: id },
      isRead: { $eq: '0' }, // 未读状态
      status: { $eq: '1' } // 是否显示
    })
      .populate({
        path: 'tid',
        select: '_id title'
      })
      .populate({
        path: 'uid',
        select: '_id name'
      })
      .populate({
        path: 'cuid',
        select: '_id name'
      })
      .skip(limit * page)
      .limit(limit)
      .sort({ created: -1 })
  },
  getTotal: function (id) {
    return this.find({ uid: id, isRead: '0', status: '1' }).countDocuments()
  }
  // 第一种方法
  // getMsgList: function (id, page, limit) {
  //   return this.aggregate([
  //     {
  //       $lookup: {
  //         from: 'posts',
  //         let: { pid: { $toObjectId: '$tid' } },
  //         pipeline: [
  //           { $match: { $expr: { $eq: ['$_id', '$$pid'] } } },
  //           { $project: { _id: 1, uid: 1, content: 1 } }
  //         ],
  //         as: 'post'
  //       }
  //     },
  //     {
  //       $replaceRoot: {
  //         newRoot: {
  //           $mergeObjects: [{ $arrayElemAt: ['$post', 0] }, '$$ROOT']
  //         }
  //       }
  //     },
  //     { $addFields: { userId: { $toObjectId: '$uid' } } },
  //     { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'tuid' } },
  //     { $unwind: '$tuid' },
  //     { $addFields: { fuserId: { $toObjectId: '$cuid' } } },
  //     { $lookup: { from: 'users', localField: 'fuserId', foreignField: '_id', as: 'fuid' } },
  //     { $unwind: '$fuid' },
  //     { $project: { post: 0, tuid: { username: 0, password: 0 }, fuid: { username: 0, password: 0 }, userId: 0, fuserId: 0, tid: 0, cuid: 0 } },
  //     { $match: { uid: id, status: '1', isRead: '0' } }
  //   ])
  //     .skip(limit * page)
  //     .limit(limit)
  //     .sort({ created: -1 })
  // }
}

const Comments = mongoose.model('comments', CommentsSchema)

export default Comments
