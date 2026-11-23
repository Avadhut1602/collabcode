// server/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  avatar: { type: String, default: '' },
  bio: { type: String, default: 'Full-stack developer building on CollabCode' },
  programmingInterests: {
    type: [String],
    default: ['JavaScript', 'Python', 'React', 'C++', 'Node.js'],
  },
  preferredLanguage: { type: String, default: 'javascript' },
  themePreference: { type: String, default: 'vs-dark', enum: ['vs-dark', 'light', 'hc-black'] },
  notificationSettings: {
    emailAlerts: { type: Boolean, default: true },
    roomInvites: { type: Boolean, default: true },
    chatMentions: { type: Boolean, default: true },
    activityUpdates: { type: Boolean, default: true },
  },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room' }],
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidate) {
  return await bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
