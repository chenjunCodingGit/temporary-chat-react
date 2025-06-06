const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 定义 User Schema (数据结构蓝图)
const UserSchema = new Schema({
  // Google 提供的唯一用户 ID，我们将用它作为主键
  googleId: {
    type: String,
    required: true,
    unique: true, // 确保每个 googleId 都是唯一的
    index: true, // 为这个字段创建索引以加快查询速度
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
  },
  // 存储加密后的 refresh token
  // 我们将存储一个对象，包含初始化向量(iv)和加密数据
  encryptedRefreshToken: {
    iv: String,
    encryptedData: String,
  },
}, {
  // timestamps 会自动为我们添加 createdAt 和 updatedAt 两个字段
  timestamps: true,
});

// 根据上面的 Schema 创建一个名为 'User' 的模型
// Mongoose 会在 MongoDB 中创建一个名为 'users' 的集合 (collection)
const User = mongoose.model('User', UserSchema);

// 导出模型，以便在项目的其他地方使用
module.exports = User;
