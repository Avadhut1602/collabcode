// server/middleware/rbac.js
const Room = require('../models/Room');

const ROLE_PRIORITY = {
  viewer: 1,
  editor: 2,
  admin: 3,
  owner: 4,
};

const requireRoomRole = (minRole) => {
  return async (req, res, next) => {
    try {
      const roomId = req.params.id || req.params.roomId;
      if (!roomId) {
        return res.status(400).json({ message: 'Room ID is required for authorization check' });
      }

      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({ message: 'Room not found' });
      }

      const userIdStr = req.user.id.toString();
      const isOwner = room.owner.toString() === userIdStr;

      let userRole = null;
      if (isOwner) {
        userRole = 'owner';
      } else {
        const member = room.members.find(
          (m) => (m.user?._id || m.user || m).toString() === userIdStr
        );
        if (member) {
          userRole = member.role || 'editor';
        }
      }

      if (!userRole) {
        return res.status(403).json({ message: 'You are not a member of this room' });
      }

      const requiredPriority = ROLE_PRIORITY[minRole] || 1;
      const userPriority = ROLE_PRIORITY[userRole] || 0;

      if (userPriority < requiredPriority) {
        return res.status(403).json({
          message: `Action requires ${minRole} permissions (your role: ${userRole})`,
        });
      }

      req.room = room;
      req.userRoomRole = userRole;
      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = { requireRoomRole, ROLE_PRIORITY };
