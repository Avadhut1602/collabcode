// server/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: {
    type: String,
    enum: ['invite', 'join', 'leave', 'mention', 'update', 'system'],
    default: 'system',
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model('Notification', notificationSchema);
