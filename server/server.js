// server/server.js
// CollabCode - Production Collaborative Coding Platform Server
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const executionRoutes = require('./routes/execution');
const aiRoutes = require('./routes/ai');
const Room = require('./models/Room');

const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Connect to MongoDB
connectDB();

// Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows Monaco editor workers and execution previews
  })
);
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate Limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many authentication attempts, please try again after 15 minutes.' },
});

const executionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: { message: 'Execution rate limit exceeded. Please wait a minute before running more code.' },
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);
app.use('/api/execute/run', executionLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/execute', executionRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'CollabCode',
    version: '2.0.0',
    dbReady: typeof connectDB.isReady === 'function' ? connectDB.isReady() : true,
    timestamp: new Date().toISOString(),
  });
});

// Static client serving for production (Render, Railway, Docker, Monolith)
const fs = require('fs');
const distPath = path.join(__dirname, '..', 'dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // SPA fallback for all non-API GET routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Root endpoint: returns developer status page when dist build is absent
  app.get('/', (req, res) => {
    if (req.accepts('html')) {
      return res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>CollabCode Server API</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #0b0f19;
              color: #f8fafc;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .card {
              background: #111827;
              padding: 2.5rem;
              border-radius: 12px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.6);
              max-width: 540px;
              text-align: center;
              border: 1px solid #1f293d;
            }
            .badge {
              display: inline-block;
              background: #10b981;
              color: #fff;
              padding: 0.35rem 0.85rem;
              border-radius: 9999px;
              font-size: 0.85rem;
              font-weight: 600;
              margin-bottom: 1rem;
            }
            h1 { margin: 0 0 0.5rem 0; font-size: 1.7rem; color: #38bdf8; }
            p { color: #94a3b8; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.5rem; }
            .btn {
              display: inline-block;
              background: #3b82f6;
              color: white;
              text-decoration: none;
              padding: 0.75rem 1.5rem;
              border-radius: 8px;
              font-weight: 600;
            }
            .endpoints {
              text-align: left;
              background: #06090e;
              padding: 1rem;
              border-radius: 8px;
              margin-top: 1.5rem;
              font-family: monospace;
              font-size: 0.85rem;
              color: #a5f3fc;
              line-height: 1.6;
            }
          </style>
        </head>
        <body>
          <div class="card">
            <span class="badge">● CollabCode Backend Online</span>
            <h1>CollabCode API & Real-time Server</h1>
            <p>WebSocket collaboration engine, multi-language execution proxy, and AI pairing service are active.</p>
            <a class="btn" href="http://localhost:5173" target="_blank">Launch CollabCode Client (localhost:5173) →</a>
            <div class="endpoints">
              <strong>Active Services:</strong><br/>
              • WebSocket (Socket.IO): Cursors, Presence & Code Sync<br/>
              • Execution Engine: /api/execute/run (JS, Python, C, C++, Java)<br/>
              • AI Assistant: /api/ai/query<br/>
              • Workspaces & Multi-file: /api/rooms<br/>
              • Authentication: /api/auth
            </div>
          </div>
        </body>
        </html>
      `);
    }

    res.json({
      status: 'online',
      platform: 'CollabCode',
      message: 'CollabCode Express & Socket.IO server running successfully!',
      frontendApp: 'http://localhost:5173',
    });
  });
}

// Central error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack);
  const status = err.statusCode || 500;
  res.status(status).json({ message: err.message || 'Internal Server Error' });
});

// ==========================================
// SOCKET.IO REAL-TIME COLLABORATION
// ==========================================

// Color palette for collaborator cursors
const COLLABORATOR_COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#14b8a6', // Teal
];

// In-memory active presence map: roomId -> Map(socketId -> userData)
const roomPresenceMap = new Map();

// Socket authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(); // Allow guest/public view with anonymous identity if needed
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next();
  }
});

io.on('connection', (socket) => {
  let currentRoomId = null;
  let currentUser = null;

  // 1. Join room
  socket.on('join-room', async ({ roomId, user }) => {
    currentRoomId = roomId;
    currentUser = user || { id: socket.id, name: 'Anonymous' };

    socket.join(roomId);

    if (!roomPresenceMap.has(roomId)) {
      roomPresenceMap.set(roomId, new Map());
    }

    const roomPresences = roomPresenceMap.get(roomId);
    const userIndex = roomPresences.size;
    const assignedColor = COLLABORATOR_COLORS[userIndex % COLLABORATOR_COLORS.length];

    const collaboratorData = {
      socketId: socket.id,
      userId: currentUser.id || currentUser._id,
      name: currentUser.name || 'Anonymous',
      avatar: currentUser.avatar || '',
      color: assignedColor,
      activeFileId: '',
      cursor: null,
      joinedAt: Date.now(),
    };

    roomPresences.set(socket.id, collaboratorData);

    // Send back current user's assigned collaborator info
    socket.emit('assigned-identity', collaboratorData);

    // Broadcast updated active presence list to all room members
    const activeMembers = Array.from(roomPresences.values());
    io.to(roomId).emit('room-presence-update', activeMembers);

    // Broadcast notification toast to teammates
    socket.to(roomId).emit('user-joined-notification', {
      user: collaboratorData,
      message: `${collaboratorData.name} joined the workspace`,
    });
  });

  // 2. Real-time code change broadcast
  socket.on('code-change', async ({ roomId, fileId, content }) => {
    // Broadcast instantly to all other users in this room
    socket.to(roomId).emit('code-update', {
      fileId,
      content,
      senderSocketId: socket.id,
    });
  });

  // 3. Live collaborator cursor movement
  socket.on('cursor-move', ({ roomId, fileId, line, column, selection }) => {
    if (!roomId) return;
    const roomPresences = roomPresenceMap.get(roomId);
    if (roomPresences && roomPresences.has(socket.id)) {
      const userPres = roomPresences.get(socket.id);
      userPres.activeFileId = fileId;
      userPres.cursor = { line, column, selection };
    }

    socket.to(roomId).emit('cursor-update', {
      socketId: socket.id,
      userId: currentUser?.id || currentUser?._id,
      userName: currentUser?.name || 'Anonymous',
      fileId,
      line,
      column,
      selection,
    });
  });

  // 4. Typing indicator
  socket.on('typing-start', ({ roomId, userName }) => {
    socket.to(roomId).emit('user-typing', {
      socketId: socket.id,
      userName: userName || currentUser?.name || 'A teammate',
    });
  });

  socket.on('typing-stop', ({ roomId }) => {
    socket.to(roomId).emit('user-stopped-typing', { socketId: socket.id });
  });

  // 5. File Tree Operations (Sync created/deleted/renamed files across all clients)
  socket.on('file-created', ({ roomId, file }) => {
    socket.to(roomId).emit('file-created-sync', file);
  });

  socket.on('file-deleted', ({ roomId, fileId }) => {
    socket.to(roomId).emit('file-deleted-sync', { fileId });
  });

  socket.on('file-renamed', ({ roomId, fileId, newName, path }) => {
    socket.to(roomId).emit('file-renamed-sync', { fileId, newName, path });
  });

  // 6. Real-time Chat Events
  socket.on('send-message', ({ roomId, message }) => {
    socket.to(roomId).emit('receive-message', message);
  });

  socket.on('message-reaction', ({ roomId, messageId, reactions }) => {
    io.to(roomId).emit('message-reaction-update', { messageId, reactions });
  });

  socket.on('message-edited', ({ roomId, message }) => {
    io.to(roomId).emit('message-edited-update', message);
  });

  socket.on('message-deleted', ({ roomId, messageId }) => {
    io.to(roomId).emit('message-deleted-update', { messageId });
  });

  // 7. Disconnect cleanup
  socket.on('disconnect', () => {
    if (currentRoomId && roomPresenceMap.has(currentRoomId)) {
      const roomPresences = roomPresenceMap.get(currentRoomId);
      const departingUser = roomPresences.get(socket.id);
      roomPresences.delete(socket.id);

      if (roomPresences.size === 0) {
        roomPresenceMap.delete(currentRoomId);
      } else {
        const remaining = Array.from(roomPresences.values());
        io.to(currentRoomId).emit('room-presence-update', remaining);
        if (departingUser) {
          io.to(currentRoomId).emit('user-left-notification', {
            user: departingUser,
            message: `${departingUser.name} left the workspace`,
          });
        }
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[CollabCode Server] Running on http://0.0.0.0:${PORT}`);
});
