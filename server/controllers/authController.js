// server/controllers/authController.js
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Room = require('../models/Room');
const ExecutionLog = require('../models/ExecutionLog');
const Notification = require('../models/Notification');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'supersecretkey', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc Register user
// @route POST /api/auth/signup
exports.signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    return res.status(400).json({ message: 'An account with that email already exists' });
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
  });

  // Welcome notification
  await Notification.create({
    recipient: user._id,
    type: 'system',
    title: 'Welcome to CollabCode! 🚀',
    message: 'Start by creating a multi-file workspace or join an existing session.',
    link: '/dashboard',
  });

  const token = generateToken(user._id);
  res.status(201).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      programmingInterests: user.programmingInterests,
      preferredLanguage: user.preferredLanguage,
      themePreference: user.themePreference,
      favorites: user.favorites,
    },
  });
});

// @desc Login user
// @route POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  let isMatch = await user.comparePassword(password);
  // Demo password fallback for built-in accounts
  if (!isMatch && (password === 'password123' || password === 'Demo@123')) {
    isMatch = (await user.comparePassword('Demo@123')) || (await user.comparePassword('password123'));
  }

  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = generateToken(user._id);
  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      programmingInterests: user.programmingInterests,
      preferredLanguage: user.preferredLanguage,
      themePreference: user.themePreference,
      favorites: user.favorites,
    },
  });
});

// @desc Get logged in user info
// @route GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    bio: user.bio,
    avatar: user.avatar,
    programmingInterests: user.programmingInterests,
    preferredLanguage: user.preferredLanguage,
    themePreference: user.themePreference,
    favorites: user.favorites || [],
    notificationSettings: user.notificationSettings,
    createdAt: user.createdAt,
  });
});

// @desc Forgot password workflow
// @route POST /api/auth/forgot-password
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email address is required' });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    // Return friendly generic message for security
    return res.json({
      message: 'If an account with that email exists, password reset instructions have been generated.',
    });
  }

  // Generate 6-digit verification code / reset token
  const resetToken = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  // In production, send email; in development/demo return the token
  res.json({
    message: 'Password reset link generated successfully.',
    resetToken, // Provided for easy developer / demo testing
  });
});

// @desc Reset password
// @route POST /api/auth/reset-password
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Reset token and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: 'Reset token is invalid or has expired' });
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: 'Password successfully updated. You may now log in with your new password.' });
});

// @desc Update user profile
// @route PUT /api/auth/profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const {
    name,
    bio,
    avatar,
    programmingInterests,
    preferredLanguage,
    themePreference,
    notificationSettings,
  } = req.body;

  if (name) user.name = name.trim();
  if (bio !== undefined) user.bio = bio;
  if (avatar !== undefined) user.avatar = avatar;
  if (programmingInterests) user.programmingInterests = programmingInterests;
  if (preferredLanguage) user.preferredLanguage = preferredLanguage;
  if (themePreference) user.themePreference = themePreference;
  if (notificationSettings) user.notificationSettings = { ...user.notificationSettings, ...notificationSettings };

  await user.save();
  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    bio: user.bio,
    avatar: user.avatar,
    programmingInterests: user.programmingInterests,
    preferredLanguage: user.preferredLanguage,
    themePreference: user.themePreference,
    favorites: user.favorites,
    notificationSettings: user.notificationSettings,
  });
});

// @desc Toggle favorite room
// @route POST /api/auth/favorites/:roomId
exports.toggleFavorite = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  const roomId = req.params.roomId;

  const index = user.favorites.findIndex((id) => id.toString() === roomId);
  let isFavorite = false;
  if (index > -1) {
    user.favorites.splice(index, 1);
  } else {
    user.favorites.push(roomId);
    isFavorite = true;
  }

  await user.save();
  res.json({ favorites: user.favorites, isFavorite });
});

// @desc Get personal coding analytics
// @route GET /api/auth/analytics
exports.getAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // 1. Rooms created by user
  const ownedRooms = await Room.find({ owner: userId });
  // 2. Rooms where user is a member
  const memberRooms = await Room.find({ 'members.user': userId });

  // 3. Execution logs for user
  const executions = await ExecutionLog.find({ user: userId }).sort({ createdAt: -1 });

  // Language breakdown
  const languageCounts = {};
  ownedRooms.forEach((r) => {
    const lang = r.language || 'javascript';
    languageCounts[lang] = (languageCounts[lang] || 0) + 1;
  });

  // Calculate execution stats
  const totalExecutions = executions.length;
  const successfulExecutions = executions.filter((e) => e.status === 'success').length;
  const successRate = totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 100;

  // Weekly activity timestamps
  const now = Date.now();
  const dayMs = 24 * 3600 * 1000;
  const last7Days = [0, 0, 0, 0, 0, 0, 0]; // Day 0 is today, Day 6 is 6 days ago

  executions.forEach((e) => {
    const daysAgo = Math.floor((now - new Date(e.createdAt).getTime()) / dayMs);
    if (daysAgo >= 0 && daysAgo < 7) {
      last7Days[6 - daysAgo] += 1;
    }
  });

  res.json({
    totalProjectsCreated: ownedRooms.length,
    totalCollaborations: memberRooms.length,
    totalExecutions,
    successfulExecutions,
    successRate,
    languageDistribution: languageCounts,
    weeklyActivity: last7Days,
    recentExecutions: executions.slice(0, 10),
  });
});

// @desc Get user notifications
// @route GET /api/auth/notifications
exports.getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user.id })
    .populate('sender', 'name email avatar')
    .sort({ createdAt: -1 })
    .limit(30);

  const unreadCount = await Notification.countDocuments({
    recipient: req.user.id,
    isRead: false,
  });

  res.json({ notifications, unreadCount });
});

// @desc Mark notification as read
// @route PUT /api/auth/notifications/:id/read
exports.markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user.id },
    { isRead: true },
    { new: true }
  );
  res.json(notification);
});

// @desc Mark all notifications as read
// @route PUT /api/auth/notifications/read-all
exports.markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user.id, isRead: false }, { isRead: true });
  res.json({ message: 'All notifications marked as read' });
});
