// server/models/Message.js
const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  emoji: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const messageSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  codeSnippet: {
    code: { type: String, default: '' },
    language: { type: String, default: 'javascript' },
  },
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  reactions: [reactionSchema],
  isEdited: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model('Message', messageSchema);
