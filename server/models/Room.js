// server/models/Room.js
const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  path: { type: String, required: true },
  content: { type: String, default: '' },
  language: { type: String, default: 'javascript' },
  isFolder: { type: Boolean, default: false },
  parentPath: { type: String, default: '/' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const memberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: {
    type: String,
    enum: ['owner', 'admin', 'editor', 'viewer'],
    default: 'editor',
  },
  joinedAt: { type: Date, default: Date.now },
});

const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },
  details: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
});

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: 'Collaborative coding workspace on CollabCode' },
  language: { type: String, default: 'javascript' },
  code: { type: String, default: '' }, // For backward compatibility with legacy single-code room
  files: [fileSchema],
  activeFileId: { type: String, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [memberSchema],
  roomCode: { type: String, required: true, unique: true, uppercase: true, index: true },
  isPublic: { type: Boolean, default: true },
  isArchived: { type: Boolean, default: false },
  tags: { type: [String], default: [] },
  activityLog: [activityLogSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexing for rapid queries
roomSchema.index({ owner: 1, createdAt: -1 });
roomSchema.index({ 'members.user': 1 });

module.exports = mongoose.model('Room', roomSchema);
