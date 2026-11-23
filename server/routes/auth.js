// server/routes/auth.js
const express = require('express');
const {
  signup,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateProfile,
  toggleFavorite,
  getAnalytics,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.use(protect);
router.get('/me', getMe);
router.put('/profile', updateProfile);
router.post('/favorites/:roomId', toggleFavorite);
router.get('/analytics', getAnalytics);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.put('/notifications/read-all', markAllNotificationsRead);

module.exports = router;
