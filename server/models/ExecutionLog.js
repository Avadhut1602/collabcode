// server/models/ExecutionLog.js
const mongoose = require('mongoose');

const executionLogSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  language: { type: String, required: true },
  code: { type: String, default: '' },
  stdin: { type: String, default: '' },
  stdout: { type: String, default: '' },
  stderr: { type: String, default: '' },
  status: {
    type: String,
    enum: ['success', 'error', 'timeout', 'compilation_error', 'unsupported'],
    default: 'success',
  },
  executionTimeMs: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model('ExecutionLog', executionLogSchema);
