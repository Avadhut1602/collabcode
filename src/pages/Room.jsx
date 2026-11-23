// src/pages/Room.jsx
import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { io } from 'socket.io-client';
import {
  ArrowLeft,
  FolderTree,
  History,
  Users,
  Settings,
  Bot,
  MessageSquare,
  Play,
  Square,
  Save,
  Copy,
  Check,
  Sun,
  Moon,
  Contrast,
  Sliders,
  Maximize2,
  Minimize2,
  FileCode,
  X,
  Plus,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Terminal,
} from 'lucide-react';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

// Workspace Panels
import FileExplorer from '../components/FileExplorer';
import VersionHistory from '../components/VersionHistory';
import UserList from '../components/UserList';
import OutputPanel from '../components/OutputPanel';
import AIPanel from '../components/AIPanel';
import ChatPanel from '../components/ChatPanel';
import './Room.css';

// Socket server URL fallback:
// 1. Explicit VITE_SOCKET_URL environment variable if set
// 2. http://localhost:5000 if running Vite dev server on port 5173
// 3. Same origin for unified production deployments
const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (typeof window !== 'undefined' && window.location.port === '5173'
    ? 'http://localhost:5000'
    : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5000'));

export default function Room() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, theme, toggleTheme } = useContext(AuthContext);

  // Room State
  const [room, setRoom] = useState(null);
  const [isRoomLoading, setIsRoomLoading] = useState(true);
  const [roomLoadError, setRoomLoadError] = useState('');

  // Multi-File & Active Tab State
  const [files, setFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState('');
  const [openTabIds, setOpenTabIds] = useState([]);
  const [unsavedChanges, setUnsavedChanges] = useState({}); // { [fileId]: boolean }
  const [saveStatus, setSaveStatus] = useState(''); // 'Saved' | 'Saving...'

  // Editor Settings
  const [editorTheme, setEditorTheme] = useState(theme === 'light' ? 'light' : 'vs-dark');
  const [editorFontSize, setEditorFontSize] = useState(14);
  const [isMinimapEnabled, setIsMinimapEnabled] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  // Layout Controls
  const [activeLeftPanel, setActiveLeftPanel] = useState('files'); // files | history | users | settings | null (collapsed)
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [activeRightPanel, setActiveRightPanel] = useState('ai'); // ai | chat
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [isOutputCollapsed, setIsOutputCollapsed] = useState(false);

  // Execution & Diagnostics
  const [output, setOutput] = useState('');
  const [stderr, setStderr] = useState('');
  const [stdin, setStdin] = useState('');
  const [executionStatus, setExecutionStatus] = useState('ready'); // ready | running | success | error | compilation_error
  const [executionTimeMs, setExecutionTimeMs] = useState(0);
  const [executionHistory, setExecutionHistory] = useState([]);

  // Socket & Real-Time Presence
  const [onlinePresence, setOnlinePresence] = useState([]);
  const [assignedIdentity, setAssignedIdentity] = useState(null);
  const [typingUser, setTypingUser] = useState('');
  const [messages, setMessages] = useState([]);
  const [toastMessage, setToastMessage] = useState('');

  // UI state
  const [isCopiedCode, setIsCopiedCode] = useState(false);

  // Refs
  const socketRef = useRef(null);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const activeFileIdRef = useRef(activeFileId);
  activeFileIdRef.current = activeFileId;
  const filesRef = useRef(files);
  filesRef.current = files;
  const teammateDecorationsRef = useRef(new Map());

  // 1. Initial Room Data Fetching
  const fetchRoom = async () => {
    try {
      setIsRoomLoading(true);
      setRoomLoadError('');

      // Fetch primary room details first to establish workspace and membership
      const roomRes = await api.get(`/rooms/${id}`);
      const roomData = roomRes.data;
      setRoom(roomData);
      setFiles(roomData.files || []);

      const initialActiveId =
        roomData.activeFileId ||
        roomData.files?.find((f) => !f.isFolder)?._id?.toString() ||
        '';

      setActiveFileId(initialActiveId);
      if (initialActiveId) {
        setOpenTabIds([initialActiveId]);
      }

      // Secondary data loaded in background without blocking room rendering
      Promise.allSettled([
        api.get(`/rooms/${id}/messages`),
        api.get(`/execute/history/${id}`),
      ]).then(([msgResult, histResult]) => {
        if (msgResult.status === 'fulfilled') {
          setMessages(msgResult.value.data || []);
        }
        if (histResult.status === 'fulfilled') {
          setExecutionHistory(histResult.value.data || []);
        }
      });
    } catch (err) {
      console.error('Error fetching room:', err);
      const isNetworkError = !err.response || err.code === 'ECONNABORTED' || err.message?.includes('Network Error');
      setRoomLoadError(
        isNetworkError
          ? 'Backend server is not running or unreachable at http://localhost:5000. Please start the server using "npm run dev".'
          : err.response?.data?.message || 'Workspace not found.'
      );
    } finally {
      setIsRoomLoading(false);
    }
  };

  useEffect(() => {
    fetchRoom();

    // Safety timeout: ensure loading state is cleared even if network hangs
    const safetyTimer = setTimeout(() => {
      setIsRoomLoading((loading) => {
        if (loading) {
          setRoomLoadError(
            'Workspace connection timed out. Please check if the backend server is running on http://localhost:5000.'
          );
          return false;
        }
        return false;
      });
    }, 10000);

    return () => clearTimeout(safetyTimer);
  }, [id]);

  // 2. Initialize Socket.IO Connection
  useEffect(() => {
    if (!id || !user) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    // Join room
    socket.emit('join-room', {
      roomId: id,
      user: {
        id: user.id || user._id,
        name: user.name,
        avatar: user.avatar,
      },
    });

    socket.on('assigned-identity', (identity) => {
      setAssignedIdentity(identity);
    });

    socket.on('room-presence-update', (presences) => {
      setOnlinePresence(presences || []);
    });

    socket.on('user-joined-notification', (data) => {
      showToast(data.message);
    });

    socket.on('user-left-notification', (data) => {
      showToast(data.message);
    });

    // Code updates from teammates
    socket.on('code-update', ({ fileId, content, senderSocketId }) => {
      setFiles((prevFiles) =>
        prevFiles.map((f) => {
          if ((f._id || f.id)?.toString() === fileId?.toString()) {
            return { ...f, content, updatedAt: new Date() };
          }
          return f;
        })
      );
    });

    // Teammate cursor updates
    socket.on('cursor-update', (cursorData) => {
      if (cursorData.fileId !== activeFileIdRef.current) return;
      renderTeammateCursor(cursorData);
    });

    // File tree updates
    socket.on('file-created-sync', (newFile) => {
      setFiles((prev) => [...prev, newFile]);
    });

    socket.on('file-deleted-sync', ({ fileId }) => {
      setFiles((prev) => prev.filter((f) => (f._id || f.id)?.toString() !== fileId?.toString()));
      setOpenTabIds((prev) => prev.filter((tid) => tid?.toString() !== fileId?.toString()));
    });

    socket.on('file-renamed-sync', ({ fileId, newName, path }) => {
      setFiles((prev) =>
        prev.map((f) =>
          (f._id || f.id)?.toString() === fileId?.toString() ? { ...f, name: newName, path } : f
        )
      );
    });

    // Chat events
    socket.on('receive-message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('message-reaction-update', ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, reactions } : m))
      );
    });

    socket.on('message-edited-update', (editedMsg) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === editedMsg._id ? editedMsg : m))
      );
    });

    socket.on('message-deleted-update', ({ messageId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, isDeleted: true, text: 'This message was deleted.' }
            : m
        )
      );
    });

    socket.on('user-typing', ({ userName }) => {
      setTypingUser(userName);
    });

    socket.on('user-stopped-typing', () => {
      setTypingUser('');
    });

    return () => {
      socket.disconnect();
    };
  }, [id, user, token]);

  const showToast = (text) => {
    setToastMessage(text);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Render teammate live cursors in Monaco
  const renderTeammateCursor = (data) => {
    if (!editorRef.current || !monacoRef.current) return;
    const monaco = monacoRef.current;
    const editor = editorRef.current;

    const { socketId, userName, userColor = '#3b82f6', line = 1, column = 1 } = data;

    // Clear old decoration for this socket
    const existingDecorations = teammateDecorationsRef.current.get(socketId) || [];

    const newDecorations = editor.deltaDecorations(existingDecorations, [
      {
        range: new monaco.Range(line, column, line, column),
        options: {
          className: `teammate-cursor-line`,
          beforeContentClassName: `teammate-cursor-tag`,
          hoverMessage: { value: `${userName} (Collaborator)` },
        },
      },
    ]);

    teammateDecorationsRef.current.set(socketId, newDecorations);
  };

  // Active File Helper
  const activeFile = files.find(
    (f) => (f._id || f.id)?.toString() === activeFileId?.toString()
  ) || files[0] || null;

  // Language mapping
  const getFileMonacoLang = (file) => {
    if (!file) return 'javascript';
    const ext = file.name?.split('.').pop().toLowerCase();
    switch (ext) {
      case 'py': return 'python';
      case 'cpp':
      case 'cc':
      case 'c': return 'cpp';
      case 'java': return 'java';
      case 'html': return 'html';
      case 'css': return 'css';
      case 'json': return 'json';
      case 'md': return 'markdown';
      case 'ts':
      case 'tsx': return 'typescript';
      default: return 'javascript';
    }
  };

  // Switch Active File
  const handleSelectFile = (file) => {
    const fileId = (file._id || file.id)?.toString();
    setActiveFileId(fileId);
    if (!openTabIds.includes(fileId)) {
      setOpenTabIds((prev) => [...prev, fileId]);
    }
    // Update active file in backend
    api.put(`/rooms/${id}/active-file`, { fileId }).catch(() => {});
  };

  const handleCloseTab = (fileId, e) => {
    e.stopPropagation();
    const newTabs = openTabIds.filter((tid) => tid !== fileId);
    setOpenTabIds(newTabs);
    if (activeFileId === fileId) {
      setActiveFileId(newTabs[newTabs.length - 1] || '');
    }
  };

  // Code Change in Monaco
  const handleEditorChange = (newContent) => {
    if (!activeFile) return;
    const fileId = (activeFile._id || activeFile.id)?.toString();

    // 1. Update local files state
    setFiles((prev) =>
      prev.map((f) =>
        (f._id || f.id)?.toString() === fileId ? { ...f, content: newContent } : f
      )
    );

    setUnsavedChanges((prev) => ({ ...prev, [fileId]: true }));
    setSaveStatus('Unsaved changes');

    // 2. Broadcast via Socket.IO
    if (socketRef.current) {
      socketRef.current.emit('code-change', {
        roomId: id,
        fileId,
        content: newContent,
      });
    }

    // 3. Debounced Auto-Save to MongoDB (2000ms)
    debounceSaveFile(fileId, newContent);
  };

  const saveTimerRef = useRef(null);
  const debounceSaveFile = (fileId, content) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        setSaveStatus('Saving...');
        await api.put(`/rooms/${id}/files/${fileId}`, { content });
        setUnsavedChanges((prev) => ({ ...prev, [fileId]: false }));
        setSaveStatus('Saved');
        setTimeout(() => setSaveStatus(''), 2000);
      } catch (err) {
        setSaveStatus('Save failed');
      }
    }, 2000);
  };

  const handleManualSave = async () => {
    if (!activeFile) return;
    const fileId = (activeFile._id || activeFile.id)?.toString();
    try {
      setSaveStatus('Saving...');
      await api.put(`/rooms/${id}/files/${fileId}`, { content: activeFile.content });
      setUnsavedChanges((prev) => ({ ...prev, [fileId]: false }));
      setSaveStatus('Saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (err) {
      setSaveStatus('Save failed');
    }
  };

  // Handle cursor movement inside editor
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Format action
    editor.addCommand(monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.KeyF, () => {
      editor.getAction('editor.action.formatDocument')?.run();
    });

    // Save action (Ctrl+S / Cmd+S)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleManualSave();
    });

    // Run action (Ctrl+Enter / Cmd+Enter)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleRunCode();
    });

    // Track Cursor & Selection
    editor.onDidChangeCursorPosition((e) => {
      if (socketRef.current && activeFileIdRef.current) {
        socketRef.current.emit('cursor-move', {
          roomId: id,
          fileId: activeFileIdRef.current,
          line: e.position.lineNumber,
          column: e.position.column,
        });
      }
    });

    editor.onDidChangeCursorSelection((e) => {
      const model = editor.getModel();
      if (model) {
        const text = model.getValueInRange(e.selection);
        setSelectedText(text);
      }
    });
  };

  // Run Code execution
  const handleRunCode = async () => {
    if (!activeFile) return;
    if (isOutputCollapsed) setIsOutputCollapsed(false);

    setExecutionStatus('running');
    setOutput('');
    setStderr('');

    const targetLang = getFileMonacoLang(activeFile);

    try {
      const res = await api.post('/execute/run', {
        roomId: id,
        language: targetLang,
        code: activeFile.content || '',
        stdin,
      });

      const { stdout, stderr: runErr, status, executionTimeMs: timeMs } = res.data;
      setOutput(stdout || '');
      setStderr(runErr || '');
      setExecutionStatus(status || 'success');
      setExecutionTimeMs(timeMs || 0);

      // Refresh history list
      api.get(`/execute/history/${id}`).then((h) => setExecutionHistory(h.data || []));
    } catch (err) {
      setExecutionStatus('error');
      setStderr(err.response?.data?.stderr || err.message || 'Execution failed');
    }
  };

  // File operations
  const handleCreateFile = async ({ name, isFolder, parentPath, content, language: lang }) => {
    try {
      const res = await api.post(`/rooms/${id}/files`, {
        name,
        isFolder,
        parentPath,
        content,
        language: lang,
      });

      setFiles(res.data.files);
      if (!isFolder && res.data.createdFile) {
        const newId = res.data.createdFile._id?.toString();
        setActiveFileId(newId);
        setOpenTabIds((prev) => [...prev, newId]);
      }

      if (socketRef.current && res.data.createdFile) {
        socketRef.current.emit('file-created', { roomId: id, file: res.data.createdFile });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create file');
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      const res = await api.delete(`/rooms/${id}/files/${fileId}`);
      setFiles(res.data.files);
      setActiveFileId(res.data.activeFileId);
      setOpenTabIds((prev) => prev.filter((tid) => tid !== fileId));

      if (socketRef.current) {
        socketRef.current.emit('file-deleted', { roomId: id, fileId });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete file');
    }
  };

  const handleRenameFile = async (fileId, newName) => {
    try {
      const res = await api.put(`/rooms/${id}/files/${fileId}/rename`, { newName });
      setFiles(res.data.files);
      if (socketRef.current) {
        socketRef.current.emit('file-renamed', { roomId: id, fileId, newName });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to rename file');
    }
  };

  // Chat message send
  const handleSendChatMessage = async ({ text, codeSnippet, replyTo }) => {
    try {
      const res = await api.post(`/rooms/${id}/messages`, {
        text,
        codeSnippet,
        replyTo,
      });
      setMessages((prev) => [...prev, res.data]);
      if (socketRef.current) {
        socketRef.current.emit('send-message', { roomId: id, message: res.data });
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleChatReaction = async (messageId, emoji) => {
    try {
      const res = await api.post(`/rooms/${id}/messages/${messageId}/react`, { emoji });
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, reactions: res.data.reactions } : m))
      );
      if (socketRef.current) {
        socketRef.current.emit('message-reaction', {
          roomId: id,
          messageId,
          reactions: res.data.reactions,
        });
      }
    } catch (err) {
      console.error('Reaction error:', err);
    }
  };

  const handleEditChatMessage = async (messageId, text) => {
    try {
      const res = await api.put(`/rooms/${id}/messages/${messageId}`, { text });
      setMessages((prev) => prev.map((m) => (m._id === messageId ? res.data : m)));
      if (socketRef.current) {
        socketRef.current.emit('message-edited', { roomId: id, message: res.data });
      }
    } catch (err) {
      console.error('Edit error:', err);
    }
  };

  const handleDeleteChatMessage = async (messageId) => {
    try {
      await api.delete(`/rooms/${id}/messages/${messageId}`);
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId ? { ...m, isDeleted: true, text: 'This message was deleted.' } : m
        )
      );
      if (socketRef.current) {
        socketRef.current.emit('message-deleted', { roomId: id, messageId });
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Member role management
  const handleUpdateMemberRole = async (memberId, role) => {
    try {
      await api.put(`/rooms/${id}/members/${memberId}/role`, { role });
      fetchRoom();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update member role');
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await api.delete(`/rooms/${id}/members/${memberId}`);
      fetchRoom();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  // Copy Room Code
  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(room?.roomCode || id);
    setIsCopiedCode(true);
    setTimeout(() => setIsCopiedCode(false), 2000);
  };

  // Insert AI code at cursor position
  const handleInsertCodeAtCursor = (codeToInsert) => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    const selection = editor.getSelection();
    editor.executeEdits('ai-assistant', [
      {
        range: selection,
        text: codeToInsert,
        forceMoveMarkers: true,
      },
    ]);
  };

  const handleReplaceSelectedCode = (replacementCode) => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    const selection = editor.getSelection();
    editor.executeEdits('ai-assistant', [
      {
        range: selection,
        text: replacementCode,
        forceMoveMarkers: true,
      },
    ]);
  };

  const isOwner = (room?.owner?._id || room?.owner)?.toString() === (user?.id || user?._id)?.toString();

  if (isRoomLoading) {
    return (
      <div className="workspace-loading-screen">
        <Sparkles size={28} className="loading-spinner-icon" />
        <h2>Launching CollabCode Workspace...</h2>
        <p>Connecting real-time sockets, files, and compilers.</p>
      </div>
    );
  }

  if (roomLoadError) {
    return (
      <div className="workspace-error-screen">
        <h2>Workspace Error</h2>
        <p style={{ maxWidth: '520px', lineHeight: 1.6, margin: '0.75rem auto 1.5rem' }}>
          {roomLoadError}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button type="button" className="btn btn-outline" onClick={fetchRoom}>
            Retry Connection
          </button>
          <Link to="/dashboard" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`workspace-root ${isLeftCollapsed ? 'left-collapsed' : ''} ${
        isRightCollapsed ? 'right-collapsed' : ''
      } ${isOutputCollapsed ? 'output-collapsed' : ''}`}
    >
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="workspace-toast">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. TOP HEADER TOOLBAR */}
      <header className="workspace-top-toolbar">
        <div className="toolbar-left-cluster">
          <Link to="/dashboard" className="back-dashboard-btn" title="Back to Dashboard">
            <ArrowLeft size={16} />
            <span className="hide-mobile">Dashboard</span>
          </Link>

          <div className="workspace-identity">
            <h1 className="workspace-name">{room?.name}</h1>
            <button
              type="button"
              className="room-code-tag"
              onClick={handleCopyRoomCode}
              title="Click to copy room code"
            >
              <span>Code: <strong>{room?.roomCode}</strong></span>
              {isCopiedCode ? <Check size={12} className="text-emerald" /> : <Copy size={12} />}
            </button>
            {saveStatus && <span className="workspace-save-status">{saveStatus}</span>}
          </div>
        </div>

        <div className="toolbar-right-cluster">
          {/* Active Collaborators Headshots */}
          <div className="header-collaborator-avatars hide-mobile">
            {onlinePresence.slice(0, 4).map((p) => (
              <div
                key={p.socketId}
                className="header-avatar-circle"
                style={{ backgroundColor: p.color }}
                title={`${p.name} (Live in room)`}
              >
                {p.name?.[0]?.toUpperCase() || 'U'}
              </div>
            ))}
            {onlinePresence.length > 4 && (
              <span className="more-collaborators">+{onlinePresence.length - 4}</span>
            )}
          </div>

          {/* Theme Switcher */}
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-icon hide-mobile"
            onClick={toggleTheme}
            title="Toggle Visual Theme"
          >
            {theme === 'light' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Manual Save */}
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleManualSave}
            title="Save File (Ctrl+S)"
          >
            <Save size={14} />
            <span className="hide-mobile">Save</span>
          </button>

          {/* Run Code Button */}
          <button
            type="button"
            className={`btn btn-primary btn-sm run-code-btn ${
              executionStatus === 'running' ? 'btn-executing' : ''
            }`}
            onClick={handleRunCode}
            disabled={executionStatus === 'running'}
          >
            <Play size={14} />
            <span>{executionStatus === 'running' ? 'Compiling...' : 'Run Code'}</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN 3-PANEL BODY */}
      <div className="workspace-body-layout">
        {/* =========================================
            LEFT BAR & DRAWER (Activity Bar + Panel)
           ========================================= */}
        <aside className="workspace-left-section">
          {/* Activity Bar Icons Strip */}
          <div className="activity-bar-strip">
            <button
              type="button"
              className={`activity-icon-btn ${activeLeftPanel === 'files' ? 'active' : ''}`}
              onClick={() => {
                if (activeLeftPanel === 'files' && !isLeftCollapsed) {
                  setIsLeftCollapsed(true);
                } else {
                  setActiveLeftPanel('files');
                  setIsLeftCollapsed(false);
                }
              }}
              title="Project Files Explorer"
            >
              <FolderTree size={18} />
            </button>

            <button
              type="button"
              className={`activity-icon-btn ${activeLeftPanel === 'history' ? 'active' : ''}`}
              onClick={() => {
                if (activeLeftPanel === 'history' && !isLeftCollapsed) {
                  setIsLeftCollapsed(true);
                } else {
                  setActiveLeftPanel('history');
                  setIsLeftCollapsed(false);
                }
              }}
              title="Version History Snapshots"
            >
              <History size={18} />
            </button>

            <button
              type="button"
              className={`activity-icon-btn ${activeLeftPanel === 'users' ? 'active' : ''}`}
              onClick={() => {
                if (activeLeftPanel === 'users' && !isLeftCollapsed) {
                  setIsLeftCollapsed(true);
                } else {
                  setActiveLeftPanel('users');
                  setIsLeftCollapsed(false);
                }
              }}
              title="Collaborators & Roles"
            >
              <Users size={18} />
            </button>
          </div>

          {/* Expanded Left Panel Content */}
          {!isLeftCollapsed && (
            <div className="left-panel-content">
              {activeLeftPanel === 'files' && (
                <FileExplorer
                  files={files}
                  activeFileId={activeFileId}
                  onSelectFile={handleSelectFile}
                  onCreateFile={handleCreateFile}
                  onDeleteFile={handleDeleteFile}
                  onRenameFile={handleRenameFile}
                  canEdit={true}
                />
              )}

              {activeLeftPanel === 'history' && (
                <VersionHistory
                  roomId={id}
                  currentFiles={files}
                  onRestoreVersion={(restoredRoom) => {
                    setRoom(restoredRoom);
                    setFiles(restoredRoom.files || []);
                    setActiveFileId(restoredRoom.activeFileId);
                  }}
                  canEdit={true}
                />
              )}

              {activeLeftPanel === 'users' && (
                <UserList
                  members={room?.members || []}
                  onlinePresence={onlinePresence}
                  currentUserId={user?.id || user?._id}
                  isOwner={isOwner}
                  onUpdateRole={handleUpdateMemberRole}
                  onRemoveMember={handleRemoveMember}
                  roomCode={room?.roomCode}
                />
              )}
            </div>
          )}
        </aside>

        {/* =========================================
            CENTER EDITOR & BOTTOM CONSOLE
           ========================================= */}
        <main className="workspace-center-section">
          {/* Multiple Open File Tabs Strip */}
          <div className="editor-tabs-strip">
            <div className="tabs-scroll-area">
              {openTabIds.map((tabId) => {
                const file = files.find((f) => (f._id || f.id)?.toString() === tabId);
                if (!file) return null;
                const isActive = activeFileId === tabId;
                const isUnsaved = unsavedChanges[tabId];

                return (
                  <div
                    key={tabId}
                    className={`editor-file-tab ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveFileId(tabId)}
                  >
                    <FileCode size={13} className="tab-icon" />
                    <span className="tab-name">{file.name}</span>
                    {isUnsaved && <span className="tab-unsaved-dot">●</span>}
                    <button
                      type="button"
                      className="tab-close-btn"
                      onClick={(e) => handleCloseTab(tabId, e)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Editor Sub-toolbar (Format, Minimap, Font size) */}
            <div className="editor-subtoolbar">
              <span className="breadcrumb-path hide-mobile">
                {activeFile?.path || '/'}
              </span>

              <button
                type="button"
                className="btn btn-ghost btn-sm subtool-btn"
                onClick={() => editorRef.current?.getAction('editor.action.formatDocument')?.run()}
                title="Format Code (Alt+Shift+F)"
              >
                Format
              </button>

              <button
                type="button"
                className={`btn btn-ghost btn-sm subtool-btn ${isMinimapEnabled ? 'active' : ''}`}
                onClick={() => setIsMinimapEnabled((prev) => !prev)}
                title="Toggle Minimap"
              >
                Map
              </button>

              <select
                className="font-size-select"
                value={editorFontSize}
                onChange={(e) => setEditorFontSize(Number(e.target.value))}
                title="Font Size"
              >
                <option value={12}>12px</option>
                <option value={14}>14px</option>
                <option value={16}>16px</option>
                <option value={18}>18px</option>
              </select>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="monaco-wrapper">
            {activeFile ? (
              <Editor
                key={`${activeFile._id || activeFile.id}-${getFileMonacoLang(activeFile)}`}
                height="100%"
                language={getFileMonacoLang(activeFile)}
                theme={theme === 'light' ? 'light' : 'vs-dark'}
                value={activeFile.content || ''}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={{
                  fontSize: editorFontSize,
                  fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                  minimap: { enabled: isMinimapEnabled },
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  lineNumbers: 'on',
                  renderWhitespace: 'selection',
                  bracketPairColorization: { enabled: true },
                  autoClosingBrackets: 'always',
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: 'on',
                  wordWrap: 'on',
                }}
              />
            ) : (
              <div className="no-file-selected">
                <FileCode size={40} color="var(--text-muted)" />
                <h3>No File Open</h3>
                <p>Select a file from the explorer on the left or click "+" to create one.</p>
              </div>
            )}
          </div>

          {/* Bottom Execution Console */}
          <div className={`workspace-bottom-console ${isOutputCollapsed ? 'collapsed' : ''}`}>
            <OutputPanel
              output={output}
              stderr={stderr}
              isRunning={executionStatus === 'running'}
              status={executionStatus}
              executionTimeMs={executionTimeMs}
              stdin={stdin}
              onStdinChange={setStdin}
              onRun={handleRunCode}
              onStop={() => setExecutionStatus('ready')}
              onClear={() => {
                setOutput('');
                setStderr('');
                setExecutionStatus('ready');
              }}
              isCollapsed={isOutputCollapsed}
              onToggleCollapse={() => setIsOutputCollapsed((prev) => !prev)}
              executionHistory={executionHistory}
            />
          </div>
        </main>

        {/* =========================================
            RIGHT SIDEBAR (AI Assistant & Team Chat)
           ========================================= */}
        <aside className={`workspace-right-section ${isRightCollapsed ? 'collapsed' : ''}`}>
          {/* Header Switcher */}
          <div className="right-panel-header">
            <div className="right-tab-switch">
              <button
                type="button"
                className={`right-tab-btn ${activeRightPanel === 'ai' ? 'active' : ''}`}
                onClick={() => {
                  setActiveRightPanel('ai');
                  setIsRightCollapsed(false);
                }}
              >
                <Bot size={14} />
                <span>AI Assistant</span>
              </button>

              <button
                type="button"
                className={`right-tab-btn ${activeRightPanel === 'chat' ? 'active' : ''}`}
                onClick={() => {
                  setActiveRightPanel('chat');
                  setIsRightCollapsed(false);
                }}
              >
                <MessageSquare size={14} />
                <span>Chat</span>
              </button>
            </div>

            <button
              type="button"
              className="collapse-side-btn"
              onClick={() => setIsRightCollapsed((prev) => !prev)}
              title={isRightCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isRightCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>
          </div>

          {/* Right Panel Body */}
          {!isRightCollapsed && (
            <div className="right-panel-body">
              {activeRightPanel === 'ai' ? (
                <AIPanel
                  activeFile={activeFile}
                  activeCode={activeFile?.content || ''}
                  selectedCode={selectedText}
                  language={getFileMonacoLang(activeFile)}
                  errorContext={stderr}
                  onInsertCode={handleInsertCodeAtCursor}
                  onReplaceCode={handleReplaceSelectedCode}
                />
              ) : (
                <ChatPanel
                  messages={messages}
                  onSendMessage={handleSendChatMessage}
                  onReaction={handleChatReaction}
                  onEditMessage={handleEditChatMessage}
                  onDeleteMessage={handleDeleteChatMessage}
                  currentUserId={user?.id || user?._id}
                  isOwner={isOwner}
                  typingUser={typingUser}
                  onTypingStart={() => {
                    if (socketRef.current) {
                      socketRef.current.emit('typing-start', { roomId: id, userName: user?.name });
                    }
                  }}
                  onTypingStop={() => {
                    if (socketRef.current) {
                      socketRef.current.emit('typing-stop', { roomId: id });
                    }
                  }}
                />
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
