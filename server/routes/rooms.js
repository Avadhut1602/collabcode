// server/routes/rooms.js
const express = require('express');
const { protect } = require('../middleware/auth');
const { requireRoomRole } = require('../middleware/rbac');
const {
  getUserRooms,
  createRoom,
  getRoomById,
  updateRoom,
  deleteRoom,
  joinRoom,
  createFile,
  updateFile,
  renameFile,
  deleteFile,
  setActiveFile,
  getVersions,
  createVersion,
  restoreVersion,
  updateMemberRole,
  removeMember,
  duplicateRoom,
  getRoomMessages,
  addRoomMessage,
  toggleReaction,
  editMessage,
  deleteMessage,
} = require('../controllers/roomController');

const router = express.Router();

router.use(protect); // all routes below require authentication

// Room CRUD
router.get('/', getUserRooms);
router.post('/', createRoom);
router.post('/join', joinRoom);
router.get('/:id', getRoomById);
router.put('/:id', requireRoomRole('editor'), updateRoom);
router.delete('/:id', deleteRoom);
router.post('/:id/duplicate', duplicateRoom);

// Multi-file operations
router.post('/:id/files', requireRoomRole('editor'), createFile);
router.put('/:id/files/:fileId', requireRoomRole('editor'), updateFile);
router.put('/:id/files/:fileId/rename', requireRoomRole('editor'), renameFile);
router.delete('/:id/files/:fileId', requireRoomRole('editor'), deleteFile);
router.put('/:id/active-file', requireRoomRole('viewer'), setActiveFile);

// Version history
router.get('/:id/versions', requireRoomRole('viewer'), getVersions);
router.post('/:id/versions', requireRoomRole('editor'), createVersion);
router.post('/:id/versions/:versionId/restore', requireRoomRole('admin'), restoreVersion);

// Member role management
router.put('/:id/members/:memberId/role', updateMemberRole);
router.delete('/:id/members/:memberId', removeMember);

// Chat & Discussion
router.get('/:id/messages', requireRoomRole('viewer'), getRoomMessages);
router.post('/:id/messages', requireRoomRole('viewer'), addRoomMessage);
router.post('/:id/messages/:messageId/react', requireRoomRole('viewer'), toggleReaction);
router.put('/:id/messages/:messageId', editMessage);
router.delete('/:id/messages/:messageId', deleteMessage);

module.exports = router;
