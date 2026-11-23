// src/components/UserList.jsx
import React from 'react';
import { Users, Crown, Shield, Edit3, Eye, Trash2, UserPlus, Check, Copy } from 'lucide-react';
import './UserList.css';

export default function UserList({
  members = [],
  onlinePresence = [],
  currentUserId,
  isOwner = false,
  onUpdateRole,
  onRemoveMember,
  roomCode,
}) {
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner':
        return <Crown size={12} className="role-icon-crown" />;
      case 'admin':
        return <Shield size={12} className="role-icon-admin" />;
      case 'editor':
        return <Edit3 size={12} className="role-icon-editor" />;
      case 'viewer':
      default:
        return <Eye size={12} className="role-icon-viewer" />;
    }
  };

  // Check if member is currently connected via Socket.IO
  const isUserOnline = (memberUser) => {
    const memId = (memberUser?._id || memberUser?.id || memberUser)?.toString();
    return onlinePresence.some(
      (p) => (p.userId || p.user?._id || p.user?.id)?.toString() === memId
    );
  };

  const getUserCursorColor = (memberUser) => {
    const memId = (memberUser?._id || memberUser?.id || memberUser)?.toString();
    const pres = onlinePresence.find(
      (p) => (p.userId || p.user?._id || p.user?.id)?.toString() === memId
    );
    return pres?.color || '#3b82f6';
  };

  return (
    <aside className="userlist-container" aria-label="Room Participants">
      <div className="userlist-header">
        <div className="userlist-title-group">
          <Users size={14} />
          <span className="userlist-title">COLLABORATORS</span>
        </div>
        <span className="userlist-badge">{members.length}</span>
      </div>

      <ul className="userlist-items">
        {members.map((m) => {
          const u = m.user || m;
          const memberId = (u?._id || u?.id || u)?.toString();
          const role = m.role || (isOwner ? 'owner' : 'editor');
          const isOnline = isUserOnline(u);
          const cursorColor = getUserCursorColor(u);
          const isCurrent = memberId === currentUserId?.toString();

          return (
            <li key={memberId || Math.random()} className="user-item">
              <div className="user-avatar-wrapper">
                <div
                  className="user-avatar"
                  style={{ backgroundColor: cursorColor }}
                  title={`Color in workspace: ${cursorColor}`}
                >
                  {getInitials(u?.name)}
                </div>
                <span
                  className={`online-dot ${isOnline ? 'online' : 'offline'}`}
                  title={isOnline ? 'Online (Connected)' : 'Offline'}
                ></span>
              </div>

              <div className="user-info">
                <div className="user-name-row">
                  <span className="user-name">
                    {u?.name || 'Teammate'} {isCurrent && '(You)'}
                  </span>
                </div>

                <div className="user-role-row">
                  <span className={`role-badge role-${role}`}>
                    {getRoleIcon(role)}
                    <span>{role.toUpperCase()}</span>
                  </span>
                </div>
              </div>

              {/* Role Management Dropdown (Owner Only, for other members) */}
              {isOwner && !isCurrent && role !== 'owner' && (
                <div className="user-admin-actions">
                  <select
                    className="role-select"
                    value={role}
                    onChange={(e) => onUpdateRole && onUpdateRole(memberId, e.target.value)}
                    aria-label="Change member role"
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>

                  <button
                    type="button"
                    className="remove-member-btn"
                    onClick={() => {
                      if (window.confirm(`Remove ${u?.name || 'user'} from this workspace?`)) {
                        onRemoveMember && onRemoveMember(memberId);
                      }
                    }}
                    title="Remove Member"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
