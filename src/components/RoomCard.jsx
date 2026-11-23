// src/components/RoomCard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Copy, Check, Star, Trash2, GitFork, ArrowRight, Clock } from 'lucide-react';
import './RoomCard.css';

export default function RoomCard({
  room,
  currentUserId,
  onDelete,
  onDuplicate,
  onToggleFavorite,
  isFavorite = false,
}) {
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(room.roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(room._id || room.id);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete workspace "${room.name}"?`)) {
      onDelete(room._id || room.id);
    }
  };

  const handleDuplicate = (e) => {
    e.stopPropagation();
    if (onDuplicate) {
      onDuplicate(room._id || room.id);
    }
  };

  const getLanguageBadge = (lang) => {
    const l = (lang || 'javascript').toLowerCase();
    if (l === 'python' || l === 'py') return { label: 'Python', cls: 'badge-py' };
    if (l === 'cpp' || l === 'c++') return { label: 'C++', cls: 'badge-cpp' };
    if (l === 'c') return { label: 'C', cls: 'badge-cpp' };
    if (l === 'java') return { label: 'Java', cls: 'badge-java' };
    return { label: 'JavaScript', cls: 'badge-js' };
  };

  const ownerId = room.owner?._id || room.owner;
  const isOwner = currentUserId && ownerId && ownerId.toString() === currentUserId.toString();
  const badgeInfo = getLanguageBadge(room.language);

  // Time formatter
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return 'Recently';
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div
      className="card room-card-item"
      onClick={() => navigate(`/room/${room._id || room.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/room/${room._id || room.id}`)}
    >
      <div className="card-top-row">
        <span className={`badge ${badgeInfo.cls}`}>{badgeInfo.label}</span>

        <div className="card-top-actions">
          <button
            type="button"
            className={`favorite-btn ${isFavorite ? 'favorited' : ''}`}
            onClick={handleFavoriteClick}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-label="Toggle favorite"
          >
            <Star size={16} fill={isFavorite ? '#f59e0b' : 'none'} color={isFavorite ? '#f59e0b' : 'currentColor'} />
          </button>

          {isOwner && (
            <button
              type="button"
              className="delete-room-btn"
              onClick={handleDelete}
              title="Delete workspace"
              aria-label="Delete room"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="card-body-section">
        <h3 className="room-title" title={room.name}>
          {room.name}
        </h3>
        <p className="room-desc">{room.description || 'Collaborative coding workspace on CollabCode'}</p>
      </div>

      <div className="card-meta-row">
        <button
          type="button"
          className="room-code-pill"
          onClick={handleCopyCode}
          title="Click to copy room code"
        >
          <span>Code: <strong>{room.roomCode}</strong></span>
          {copiedCode ? <Check size={13} className="text-emerald" /> : <Copy size={13} />}
        </button>

        <span className="updated-time">
          <Clock size={12} />
          {formatTimeAgo(room.updatedAt || room.createdAt)}
        </span>
      </div>

      <div className="card-bottom-row">
        <div className="collaborator-avatars">
          <Users size={15} className="members-icon" />
          <span>{room.members?.length || 1} joined</span>
        </div>

        <div className="card-action-buttons">
          <button
            type="button"
            className="btn btn-ghost btn-sm fork-btn"
            onClick={handleDuplicate}
            title="Duplicate / Fork workspace"
          >
            <GitFork size={14} />
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm open-workspace-btn"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/room/${room._id || room.id}`);
            }}
          >
            Open IDE <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
