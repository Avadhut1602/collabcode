// server/models/VersionSnapshot.js
const mongoose = require('mongoose');

const versionSnapshotSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
  versionNumber: { type: Number, required: true },
  description: { type: String, default: 'Manual Snapshot' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filesSnapshot: { type: Array, required: true }, // Deep copy of room files array
  activeFileId: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model('VersionSnapshot', versionSnapshotSchema);
