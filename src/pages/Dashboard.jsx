// src/pages/Dashboard.jsx
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Hash,
  Search,
  Filter,
  ArrowUpDown,
  Code2,
  FolderPlus,
  Sparkles,
  BarChart3,
  Users,
  Play,
  Layers,
  Star,
  RefreshCw,
} from 'lucide-react';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';
import RoomCard from '../components/RoomCard';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, toggleFavorite } = useContext(AuthContext);

  const [roomsList, setRoomsList] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Filters and Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [scopeFilter, setScopeFilter] = useState('all'); // all | my-projects | shared | favorites
  const [sortBy, setSortBy] = useState('updated'); // updated | name | members

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  // Create form state
  const [newRoomData, setNewRoomData] = useState({
    name: '',
    description: '',
    language: 'javascript',
    tags: '',
  });
  const [createError, setCreateError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Join form state
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // Auto-trigger join modal if URL has ?join=CODE
  useEffect(() => {
    const codeFromQuery = searchParams.get('join');
    if (codeFromQuery) {
      setRoomCodeInput(codeFromQuery.toUpperCase());
      setIsJoinModalOpen(true);
    }
  }, [searchParams]);

  // Fetch rooms and analytics
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setFetchError('');
      const [roomsRes, analyticsRes] = await Promise.allSettled([
        api.get('/rooms'),
        api.get('/auth/analytics'),
      ]);

      if (roomsRes.status === 'fulfilled') {
        setRoomsList(roomsRes.value.data);
      } else {
        setFetchError('Failed to load workspaces. Please check your connection.');
      }

      if (analyticsRes.status === 'fulfilled') {
        setAnalyticsData(analyticsRes.value.data);
      }
    } catch (err) {
      setFetchError('Failed to load workspace data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Filter and sort computation
  const filteredRooms = useMemo(() => {
    let result = [...roomsList];
    const currentUserId = (user?.id || user?._id)?.toString();

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.roomCode?.toLowerCase().includes(q)
      );
    }

    // 2. Language Filter
    if (languageFilter !== 'all') {
      result = result.filter(
        (r) => (r.language || 'javascript').toLowerCase() === languageFilter.toLowerCase()
      );
    }

    // 3. Scope Filter
    if (scopeFilter === 'my-projects') {
      result = result.filter(
        (r) => (r.owner?._id || r.owner)?.toString() === currentUserId
      );
    } else if (scopeFilter === 'shared') {
      result = result.filter(
        (r) => (r.owner?._id || r.owner)?.toString() !== currentUserId
      );
    } else if (scopeFilter === 'favorites') {
      const userFavs = user?.favorites?.map((id) => id.toString()) || [];
      result = result.filter((r) => userFavs.includes((r._id || r.id)?.toString()));
    }

    // 4. Sort By
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'members') {
        return (b.members?.length || 1) - (a.members?.length || 1);
      }
      // default: updated
      return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
    });

    return result;
  }, [roomsList, searchQuery, languageFilter, scopeFilter, sortBy, user]);

  // Create Room Handler
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomData.name.trim()) {
      setCreateError('Workspace name is required.');
      return;
    }

    try {
      setIsCreating(true);
      setCreateError('');
      const tagList = newRoomData.tags
        ? newRoomData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [newRoomData.language];

      const payload = {
        name: newRoomData.name.trim(),
        description: newRoomData.description.trim(),
        language: newRoomData.language,
        tags: tagList,
      };

      const res = await api.post('/rooms', payload);
      setRoomsList((prev) => [res.data, ...prev]);
      setIsCreateModalOpen(false);
      setNewRoomData({ name: '', description: '', language: 'javascript', tags: '' });
      navigate(`/room/${res.data._id}`);
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create workspace.');
    } finally {
      setIsCreating(false);
    }
  };

  // Join Room Handler
  const handleJoinWithCode = async (e) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) {
      setJoinError('Please enter a 6-character room code.');
      return;
    }

    try {
      setIsJoining(true);
      setJoinError('');
      const res = await api.post('/rooms/join', {
        roomCode: roomCodeInput.trim().toUpperCase(),
      });
      setIsJoinModalOpen(false);
      setRoomCodeInput('');
      navigate(`/room/${res.data.roomId}`);
    } catch (err) {
      setJoinError(err.response?.data?.message || 'Invalid or non-existent room code.');
    } finally {
      setIsJoining(false);
    }
  };

  // Delete Room Handler
  const handleDeleteRoom = async (roomId) => {
    try {
      await api.delete(`/rooms/${roomId}`);
      setRoomsList((prev) => prev.filter((r) => (r._id || r.id) !== roomId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete workspace.');
    }
  };

  // Duplicate Room Handler
  const handleDuplicateRoom = async (roomId) => {
    try {
      const res = await api.post(`/rooms/${roomId}/duplicate`);
      setRoomsList((prev) => [res.data, ...prev]);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to duplicate workspace.');
    }
  };

  return (
    <div className="dashboard-page-container">
      {/* 1. Header & Welcome Area */}
      <div className="dashboard-top-banner">
        <div className="welcome-text-group">
          <h1>Welcome back, {user?.name || 'Developer'} 👋</h1>
          <p>Manage, collaborate, and spin up isolated multi-file workspaces.</p>
        </div>

        <div className="dashboard-top-ctas">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setIsJoinModalOpen(true)}
          >
            <Hash size={16} />
            <span>Join with Code</span>
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={16} />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* 2. Metrics Statistics Banner */}
      <div className="metrics-banner-grid">
        <div className="card metric-card">
          <div className="metric-icon-box bg-blue">
            <Layers size={18} />
          </div>
          <div>
            <span className="metric-label">Total Workspaces</span>
            <h3 className="metric-value">{roomsList.length}</h3>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-icon-box bg-emerald">
            <Users size={18} />
          </div>
          <div>
            <span className="metric-label">Collaborations</span>
            <h3 className="metric-value">
              {analyticsData?.totalCollaborations || roomsList.filter((r) => r.members?.length > 1).length}
            </h3>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-icon-box bg-amber">
            <Play size={18} />
          </div>
          <div>
            <span className="metric-label">Code Runs Executed</span>
            <h3 className="metric-value">{analyticsData?.totalExecutions || 0}</h3>
          </div>
        </div>

        <div className="card metric-card">
          <div className="metric-icon-box bg-purple">
            <Sparkles size={18} />
          </div>
          <div>
            <span className="metric-label">Success Rate</span>
            <h3 className="metric-value">{analyticsData?.successRate ? `${analyticsData.successRate}%` : '100%'}</h3>
          </div>
        </div>
      </div>

      {/* 3. Search, Filter, and View Controls */}
      <div className="dashboard-controls-bar">
        {/* Search */}
        <div className="dashboard-search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="input dashboard-search-input"
            placeholder="Search workspaces or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Language Filter Pills */}
        <div className="language-filter-pills">
          {['all', 'javascript', 'python', 'cpp', 'java'].map((lang) => (
            <button
              key={lang}
              type="button"
              className={`filter-pill ${languageFilter === lang ? 'active' : ''}`}
              onClick={() => setLanguageFilter(lang)}
            >
              {lang === 'all' ? 'All Languages' : lang === 'cpp' ? 'C++' : lang.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Scope and Sorting */}
        <div className="controls-right-group">
          <select
            className="input controls-select"
            value={scopeFilter}
            onChange={(e) => setScopeFilter(e.target.value)}
            aria-label="Filter scope"
          >
            <option value="all">All Projects</option>
            <option value="my-projects">My Projects</option>
            <option value="shared">Shared with Me</option>
            <option value="favorites">Favorites</option>
          </select>

          <select
            className="input controls-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort projects"
          >
            <option value="updated">Recently Updated</option>
            <option value="name">Alphabetical</option>
            <option value="members">Most Members</option>
          </select>
        </div>
      </div>

      {/* 4. Workspaces Grid */}
      {fetchError && (
        <div className="dashboard-error-banner">
          <span>{fetchError}</span>
          <button type="button" className="btn btn-outline btn-sm" onClick={fetchDashboardData}>
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="rooms-grid">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card skeleton-card">
              <div className="skeleton-line" style={{ width: '40%', height: '16px' }}></div>
              <div className="skeleton-line" style={{ width: '80%', height: '22px', margin: '1rem 0 0.5rem' }}></div>
              <div className="skeleton-line" style={{ width: '90%', height: '14px' }}></div>
              <div className="skeleton-line" style={{ width: '60%', height: '14px', marginBottom: '1.5rem' }}></div>
              <div className="skeleton-line" style={{ width: '100%', height: '32px' }}></div>
            </div>
          ))}
        </div>
      ) : filteredRooms.length > 0 ? (
        <div className="rooms-grid">
          {filteredRooms.map((room) => {
            const isFav = user?.favorites?.some(
              (id) => id.toString() === (room._id || room.id)?.toString()
            );
            return (
              <RoomCard
                key={room._id || room.id}
                room={room}
                currentUserId={user?.id || user?._id}
                onDelete={handleDeleteRoom}
                onDuplicate={handleDuplicateRoom}
                onToggleFavorite={toggleFavorite}
                isFavorite={isFav}
              />
            );
          })}
        </div>
      ) : (
        <div className="dashboard-empty-state card">
          <FolderPlus size={44} className="empty-icon text-muted" />
          <h3>No Workspaces Found</h3>
          <p>
            {searchQuery || languageFilter !== 'all' || scopeFilter !== 'all'
              ? 'No projects match your active search and filter criteria.'
              : "You haven't created or joined any workspaces yet."}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            {(searchQuery || languageFilter !== 'all' || scopeFilter !== 'all') && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setSearchQuery('');
                  setLanguageFilter('all');
                  setScopeFilter('all');
                }}
              >
                Clear Filters
              </button>
            )}
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus size={16} /> Create Workspace
            </button>
          </div>
        </div>
      )}

      {/* 5. Create Project Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Launch New Workspace</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsCreateModalOpen(false)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateRoom}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {createError && <div className="auth-alert error-alert">{createError}</div>}

                <div className="form-group">
                  <label htmlFor="create-name" className="form-label">
                    Project / Room Name *
                  </label>
                  <input
                    id="create-name"
                    type="text"
                    className="input"
                    placeholder="e.g. Distributed Consensus Lab"
                    value={newRoomData.name}
                    onChange={(e) => setNewRoomData({ ...newRoomData, name: e.target.value })}
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="create-desc" className="form-label">
                    Description
                  </label>
                  <input
                    id="create-desc"
                    type="text"
                    className="input"
                    placeholder="Short description of the goal or algorithm"
                    value={newRoomData.description}
                    onChange={(e) => setNewRoomData({ ...newRoomData, description: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="create-lang" className="form-label">
                    Starter Language & Environment
                  </label>
                  <select
                    id="create-lang"
                    className="input"
                    value={newRoomData.language}
                    onChange={(e) => setNewRoomData({ ...newRoomData, language: e.target.value })}
                  >
                    <option value="javascript">JavaScript (ES6 Modules & Node.js)</option>
                    <option value="python">Python 3 (Algorithm Template)</option>
                    <option value="cpp">C++ (STL High Performance)</option>
                    <option value="c">C (Systems Programming)</option>
                    <option value="java">Java 17 (Object-Oriented)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="create-tags" className="form-label">
                    Tags (comma-separated)
                  </label>
                  <input
                    id="create-tags"
                    type="text"
                    className="input"
                    placeholder="e.g. algorithms, trees, leetcode"
                    value={newRoomData.tags}
                    onChange={(e) => setNewRoomData({ ...newRoomData, tags: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isCreating}>
                  {isCreating ? 'Initializing...' : 'Launch Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Join Room with Code Modal */}
      {isJoinModalOpen && (
        <div className="modal-overlay" onClick={() => setIsJoinModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Join Workspace with Code</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsJoinModalOpen(false)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleJoinWithCode}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {joinError && <div className="auth-alert error-alert">{joinError}</div>}

                <div className="form-group">
                  <label htmlFor="join-code" className="form-label">
                    Enter 6-Character Room Code
                  </label>
                  <input
                    id="join-code"
                    type="text"
                    className="input font-mono"
                    placeholder="e.g. PYTH01"
                    maxLength={6}
                    value={roomCodeInput}
                    onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                    style={{ textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '1.1rem' }}
                    autoFocus
                  />
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Ask the project owner for their 6-character room code to collaborate instantly.
                </span>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsJoinModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isJoining}>
                  {isJoining ? 'Connecting...' : 'Join Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
