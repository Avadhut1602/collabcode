// server/controllers/roomController.js
const crypto = require('crypto');
const Room = require('../models/Room');
const Message = require('../models/Message');
const VersionSnapshot = require('../models/VersionSnapshot');
const Notification = require('../models/Notification');
const User = require('../models/User');

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Generate 6-char room code
const generateRoomCode = async () => {
  let code;
  let exists = true;
  while (exists) {
    code = crypto.randomBytes(3).toString('hex').toUpperCase();
    const room = await Room.findOne({ roomCode: code });
    if (!room) exists = false;
  }
  return code;
};

// Multi-file starter project templates
const getStarterFiles = (language, name = 'main') => {
  switch (language) {
    case 'python':
      return [
        {
          name: 'main.py',
          path: '/main.py',
          content: `# ${name} - Python Collaborative Project
import sys

def solve():
    print("Welcome to CollabCode Python Environment!")
    nums = [2, 7, 11, 15]
    target = 9
    print(f"Sample data: {nums}, Target: {target}")

if __name__ == "__main__":
    solve()
`,
          language: 'python',
          isFolder: false,
        },
        {
          name: 'utils.py',
          path: '/utils.py',
          content: `# Utility functions
def format_result(data):
    return f"[Output]: {data}"
`,
          language: 'python',
          isFolder: false,
        },
        {
          name: 'README.md',
          path: '/README.md',
          content: `# ${name}
Collaborative Python project built on CollabCode.
`,
          language: 'markdown',
          isFolder: false,
        },
      ];

    case 'cpp':
      return [
        {
          name: 'main.cpp',
          path: '/main.cpp',
          content: `// ${name} - C++ High Performance Workspace
#include <iostream>
#include <vector>
#include <chrono>

template <typename T>
class SimpleVector {
private:
    T* data;
    size_t capacity;
    size_t length;

    void resize(size_t newCap) {
        T* newData = new T[newCap];
        for (size_t i = 0; i < length; ++i) {
            newData[i] = std::move(data[i]);
        }
        delete[] data;
        data = newData;
        capacity = newCap;
    }

public:
    SimpleVector() : data(new T[4]), capacity(4), length(0) {}
    ~SimpleVector() { delete[] data; }

    void push(const T& val) {
        if (length == capacity) resize(capacity * 2);
        data[length++] = val;
    }

    size_t size() const { return length; }
    T& operator[](size_t index) { return data[index]; }
};

int main() {
    std::cout << "========================================" << std::endl;
    std::cout << "   C++ Custom Vector Benchmark Suite    " << std::endl;
    std::cout << "========================================" << std::endl;

    SimpleVector<int> vec;
    for (int i = 1; i <= 10; ++i) {
        vec.push(i * 10);
    }

    std::cout << "Pushed elements: ";
    for (size_t i = 0; i < vec.size(); ++i) {
        std::cout << vec[i] << " ";
    }
    std::cout << std::endl;
    std::cout << "Total elements: " << vec.size() << std::endl;
    std::cout << "Memory check: 0 leaks detected." << std::endl;

    return 0;
}
`,
          language: 'cpp',
          isFolder: false,
        },
        {
          name: 'include/custom_vector.hpp',
          path: '/include/custom_vector.hpp',
          content: `// Header for custom vector implementation
#pragma once
#include <cstddef>

template <typename T>
class CustomVector {
public:
    void reallocate(size_t newCap);
};
`,
          language: 'cpp',
          isFolder: false,
        },
        {
          name: 'README.md',
          path: '/README.md',
          content: `# ${name}
High-performance C++ workspace with custom data structures and benchmarks.
`,
          language: 'markdown',
          isFolder: false,
        },
      ];

    case 'c':
      return [
        {
          name: 'main.c',
          path: '/main.c',
          content: `// ${name} - C Collaborative Project
#include <stdio.h>

int main() {
    printf("========================================\\n");
    printf("   Welcome to CollabCode C Environment! \\n");
    printf("========================================\\n");
    printf("Calculation demo: 100 * 5 = %d\\n", 100 * 5);
    return 0;
}
`,
          language: 'c',
          isFolder: false,
        },
        {
          name: 'README.md',
          path: '/README.md',
          content: `# ${name}\nC systems project.\n`,
          language: 'markdown',
          isFolder: false,
        },
      ];

    case 'java':
      return [
        {
          name: 'Main.java',
          path: '/Main.java',
          content: `// ${name} - Java OOP & Design Patterns Runner
import java.util.*;

// Singleton Pattern
class DatabaseConnection {
    private static volatile DatabaseConnection instance;
    private final String connectionString;

    private DatabaseConnection() {
        this.connectionString = "jdbc:postgresql://localhost:5432/collabcode_db";
    }

    public static DatabaseConnection getInstance() {
        if (instance == null) {
            synchronized (DatabaseConnection.class) {
                if (instance == null) {
                    instance = new DatabaseConnection();
                }
            }
        }
        return instance;
    }

    public void query(String sql) {
        System.out.println("[DB Query] Executing: " + sql);
    }
}

// Factory Pattern
interface NotificationService {
    void send(String recipient, String message);
}

class EmailNotification implements NotificationService {
    public void send(String recipient, String message) {
        System.out.println("[Email Service] To: " + recipient + " | Message: " + message);
    }
}

class SMSNotification implements NotificationService {
    public void send(String recipient, String message) {
        System.out.println("[SMS Gateway] To: " + recipient + " | Text: " + message);
    }
}

class NotificationFactory {
    public static NotificationService create(String type) {
        if ("email".equalsIgnoreCase(type)) return new EmailNotification();
        if ("sms".equalsIgnoreCase(type)) return new SMSNotification();
        throw new IllegalArgumentException("Unknown type: " + type);
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println("==================================================");
        System.out.println("   CollabCode Java 25 Design Patterns Runner      ");
        System.out.println("==================================================");

        // 1. Singleton Test
        System.out.println("\\n--- Testing Singleton Pattern ---");
        DatabaseConnection conn1 = DatabaseConnection.getInstance();
        DatabaseConnection conn2 = DatabaseConnection.getInstance();
        System.out.println("conn1 == conn2: " + (conn1 == conn2));
        conn1.query("SELECT * FROM projects WHERE is_active = true;");

        // 2. Factory Test
        System.out.println("\\n--- Testing Factory Pattern ---");
        NotificationService email = NotificationFactory.create("email");
        NotificationService sms = NotificationFactory.create("sms");
        email.send("alex@example.com", "Project build succeeded!");
        sms.send("+1-555-0199", "Security alert: new session joined.");

        System.out.println("\\nAll Java patterns executed successfully!");
    }
}
`,
          language: 'java',
          isFolder: false,
        },
        {
          name: 'src/patterns/DatabaseConnection.java',
          path: '/src/patterns/DatabaseConnection.java',
          content: `// Singleton Implementation
public class DatabaseConnection {
    private static volatile DatabaseConnection instance;
    private DatabaseConnection() {}
    public static DatabaseConnection getInstance() {
        if (instance == null) {
            synchronized (DatabaseConnection.class) {
                if (instance == null) instance = new DatabaseConnection();
            }
        }
        return instance;
    }
}
`,
          language: 'java',
          isFolder: false,
        },
        {
          name: 'src/patterns/NotificationFactory.java',
          path: '/src/patterns/NotificationFactory.java',
          content: `// Factory Pattern Implementation
public class NotificationFactory {
    // Factory method for creating notification channels
}
`,
          language: 'java',
          isFolder: false,
        },
        {
          name: 'src/utils/Logger.java',
          path: '/src/utils/Logger.java',
          content: `// Logger Utility
public class Logger {
    public static void log(String msg) {
        System.out.println("[LOG] " + msg);
    }
}
`,
          language: 'java',
          isFolder: false,
        },
        {
          name: 'pom.xml',
          path: '/pom.xml',
          content: `<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.collabcode</groupId>
  <artifactId>design-patterns</artifactId>
  <version>1.0.0</version>
</project>
`,
          language: 'xml',
          isFolder: false,
        },
        {
          name: 'README.md',
          path: '/README.md',
          content: `# ${name}
Enterprise Java design patterns workspace demonstrating Singleton, Factory, and Observer patterns.
`,
          language: 'markdown',
          isFolder: false,
        },
      ];

    case 'javascript':
    default:
      return [
        {
          name: 'index.js',
          path: '/index.js',
          content: `// ${name} - JavaScript Collaborative Project
import { calculateSum } from './utils.js';

console.log("Welcome to CollabCode JavaScript Workspace!");
console.log("Calculated sum (10 + 25):", calculateSum(10, 25));
`,
          language: 'javascript',
          isFolder: false,
        },
        {
          name: 'utils.js',
          path: '/utils.js',
          content: `// Utility module
export function calculateSum(a, b) {
  return a + b;
}
`,
          language: 'javascript',
          isFolder: false,
        },
        {
          name: 'package.json',
          path: '/package.json',
          content: JSON.stringify(
            {
              name: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
              version: '1.0.0',
              type: 'module',
              main: 'index.js',
            },
            null,
            2
          ),
          language: 'json',
          isFolder: false,
        },
        {
          name: 'README.md',
          path: '/README.md',
          content: `# ${name}
Full-stack JavaScript project.
`,
          language: 'markdown',
          isFolder: false,
        },
      ];
  }
};

// @desc Get all rooms / filtered for dashboard
// @route GET /api/rooms
exports.getUserRooms = asyncHandler(async (req, res) => {
  const { language, search, filter } = req.query;
  const userId = req.user.id;

  let query = {};

  if (language && language !== 'all') {
    query.language = language.toLowerCase();
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { roomCode: { $regex: search, $options: 'i' } },
    ];
  }

  if (filter === 'my-projects') {
    query.owner = userId;
  } else if (filter === 'shared-with-me') {
    query = {
      ...query,
      owner: { $ne: userId },
      'members.user': userId,
    };
  }

  const rooms = await Room.find(query)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .sort({ updatedAt: -1 });

  res.json(rooms);
});

// @desc Create a new room with multi-file project files
// @route POST /api/rooms
exports.createRoom = asyncHandler(async (req, res) => {
  const { name, description, language, tags, template } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Room name is required' });
  }

  const roomCode = await generateRoomCode();
  const selectedLang = language || 'javascript';
  const initialFiles = getStarterFiles(selectedLang, name.trim());

  const room = await Room.create({
    name: name.trim(),
    description: description || 'Collaborative coding workspace',
    language: selectedLang,
    code: initialFiles[0]?.content || '',
    files: initialFiles,
    owner: req.user.id,
    members: [
      {
        user: req.user.id,
        role: 'owner',
      },
    ],
    roomCode,
    tags: tags || [selectedLang],
    activityLog: [
      {
        user: req.user.id,
        action: 'PROJECT_CREATED',
        details: `Created workspace "${name.trim()}"`,
      },
    ],
  });

  // Set activeFileId to first file
  if (room.files.length > 0) {
    room.activeFileId = room.files[0]._id.toString();
    await room.save();
  }

  // Create initial version snapshot v1
  await VersionSnapshot.create({
    room: room._id,
    versionNumber: 1,
    description: 'Initial project setup',
    author: req.user.id,
    filesSnapshot: room.files,
    activeFileId: room.activeFileId,
  });

  const populated = await Room.findById(room._id)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

  res.status(201).json(populated);
});

// @desc Get room by ID (ensures user is member or adds viewer)
// @route GET /api/rooms/:id
exports.getRoomById = asyncHandler(async (req, res) => {
  let room = await Room.findById(req.params.id)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar')
    .populate('activityLog.user', 'name email avatar');

  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  const userId = req.user.id.toString();
  const isOwner = (room.owner?._id || room.owner).toString() === userId;
  const memberIndex = room.members.findIndex(
    (m) => (m.user?._id || m.user).toString() === userId
  );

  // If room is public and user is not member, add them as viewer/editor
  if (!isOwner && memberIndex === -1) {
    room.members.push({
      user: req.user.id,
      role: 'editor',
      joinedAt: new Date(),
    });

    room.activityLog.push({
      user: req.user.id,
      action: 'MEMBER_JOINED',
      details: 'Joined session',
      timestamp: new Date(),
    });

    await room.save();
    room = await Room.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .populate('activityLog.user', 'name email avatar');
  }

  // Ensure room has multi-file structure if legacy single-code room
  if (!room.files || room.files.length === 0) {
    const ext = room.language === 'python' ? 'py' : room.language === 'cpp' ? 'cpp' : 'js';
    room.files = [
      {
        name: `main.${ext}`,
        path: `/main.${ext}`,
        content: room.code || '// Start coding',
        language: room.language || 'javascript',
        isFolder: false,
      },
    ];
    room.activeFileId = room.files[0]._id.toString();
    await room.save();
  }

  res.json(room);
});

// @desc Update room settings / code / activeFile
// @route PUT /api/rooms/:id
exports.updateRoom = asyncHandler(async (req, res) => {
  const { name, description, language, code, tags, isPublic, isArchived } = req.body;
  const room = await Room.findById(req.params.id);

  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  if (name) room.name = name.trim();
  if (description !== undefined) room.description = description;
  if (language) room.language = language;
  if (tags) room.tags = tags;
  if (isPublic !== undefined) room.isPublic = isPublic;
  if (isArchived !== undefined) room.isArchived = isArchived;
  if (code !== undefined) {
    room.code = code;
    // Also update active file content if present
    if (room.activeFileId) {
      const activeFile = room.files.find((f) => f._id.toString() === room.activeFileId);
      if (activeFile) {
        activeFile.content = code;
        activeFile.updatedAt = new Date();
      }
    } else if (room.files.length > 0) {
      room.files[0].content = code;
      room.files[0].updatedAt = new Date();
    }
  }

  room.updatedAt = new Date();
  await room.save();

  const populated = await Room.findById(room._id)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

  res.json(populated);
});

// @desc Join room by 6-char code
// @route POST /api/rooms/join
exports.joinRoom = asyncHandler(async (req, res) => {
  const { roomCode } = req.body;
  if (!roomCode) {
    return res.status(400).json({ message: '6-character roomCode is required' });
  }

  const room = await Room.findOne({ roomCode: roomCode.trim().toUpperCase() });
  if (!room) {
    return res.status(404).json({ message: 'No workspace found with that code' });
  }

  const userId = req.user.id.toString();
  const isOwner = room.owner.toString() === userId;
  const isMember = room.members.some((m) => (m.user?._id || m.user).toString() === userId);

  if (!isOwner && !isMember) {
    room.members.push({
      user: req.user.id,
      role: 'editor',
      joinedAt: new Date(),
    });

    room.activityLog.push({
      user: req.user.id,
      action: 'MEMBER_JOINED',
      details: 'Joined via room code',
      timestamp: new Date(),
    });

    await room.save();

    // Notify room owner
    if (room.owner.toString() !== userId) {
      await Notification.create({
        recipient: room.owner,
        sender: req.user.id,
        type: 'join',
        title: 'New Collaborator Joined',
        message: `A teammate joined your workspace "${room.name}".`,
        link: `/room/${room._id}`,
      });
    }
  }

  res.json({ message: 'Joined workspace successfully', roomId: room._id });
});

// @desc Delete room (owner only)
// @route DELETE /api/rooms/:id
exports.deleteRoom = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  if (room.owner.toString() !== req.user.id.toString()) {
    return res.status(403).json({ message: 'Only the project owner can delete this workspace' });
  }

  await Message.deleteMany({ room: room._id });
  await VersionSnapshot.deleteMany({ room: room._id });
  await Room.findByIdAndDelete(room._id);

  res.json({ message: 'Workspace deleted successfully' });
});

// ==========================================
// MULTI-FILE EXPLORER OPERATIONS
// ==========================================

// @desc Create file or folder in room
// @route POST /api/rooms/:id/files
exports.createFile = asyncHandler(async (req, res) => {
  const { name, isFolder, parentPath, content, language } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'File or folder name is required' });
  }

  const room = await Room.findById(req.params.id);
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  const cleanParent = parentPath && parentPath !== '/' ? parentPath.replace(/\/$/, '') : '';
  const fullPath = `${cleanParent}/${name.trim()}`;

  // Check duplicate path
  const duplicate = room.files.some((f) => f.path === fullPath);
  if (duplicate) {
    return res.status(400).json({ message: 'A file or folder with that path already exists' });
  }

  const newFile = {
    name: name.trim(),
    path: fullPath,
    content: content || '',
    language: language || 'javascript',
    isFolder: Boolean(isFolder),
    parentPath: cleanParent || '/',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  room.files.push(newFile);
  room.updatedAt = new Date();
  await room.save();

  const createdFile = room.files[room.files.length - 1];
  res.status(201).json({ files: room.files, createdFile });
});

// @desc Update file content
// @route PUT /api/rooms/:id/files/:fileId
exports.updateFile = asyncHandler(async (req, res) => {
  const { content, language } = req.body;
  const room = await Room.findById(req.params.id);
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  const file = room.files.id(req.params.fileId);
  if (!file) {
    return res.status(404).json({ message: 'File not found' });
  }

  if (content !== undefined) file.content = content;
  if (language) file.language = language;
  file.updatedAt = new Date();
  room.updatedAt = new Date();

  // If this file matches legacy room.code, update that too
  if (room.activeFileId === file._id.toString() || room.files[0]?._id.toString() === file._id.toString()) {
    room.code = file.content;
  }

  await room.save();
  res.json({ file, files: room.files });
});

// @desc Rename file or folder
// @route PUT /api/rooms/:id/files/:fileId/rename
exports.renameFile = asyncHandler(async (req, res) => {
  const { newName } = req.body;
  if (!newName || !newName.trim()) {
    return res.status(400).json({ message: 'New name is required' });
  }

  const room = await Room.findById(req.params.id);
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  const file = room.files.id(req.params.fileId);
  if (!file) {
    return res.status(404).json({ message: 'File not found' });
  }

  const oldPath = file.path;
  const cleanParent = file.parentPath && file.parentPath !== '/' ? file.parentPath.replace(/\/$/, '') : '';
  const newPath = `${cleanParent}/${newName.trim()}`;

  file.name = newName.trim();
  file.path = newPath;
  file.updatedAt = new Date();

  // If folder, update children paths as well
  if (file.isFolder) {
    room.files.forEach((f) => {
      if (f.path.startsWith(oldPath + '/')) {
        f.path = f.path.replace(oldPath, newPath);
        if (f.parentPath.startsWith(oldPath)) {
          f.parentPath = f.parentPath.replace(oldPath, newPath);
        }
      }
    });
  }

  room.updatedAt = new Date();
  await room.save();
  res.json({ files: room.files });
});

// @desc Delete file or folder
// @route DELETE /api/rooms/:id/files/:fileId
exports.deleteFile = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  const file = room.files.id(req.params.fileId);
  if (!file) {
    return res.status(404).json({ message: 'File not found' });
  }

  const targetPath = file.path;
  const isFolder = file.isFolder;

  // Remove targeted file
  room.files.pull({ _id: req.params.fileId });

  // If folder, remove all descendants
  if (isFolder) {
    room.files = room.files.filter((f) => !f.path.startsWith(targetPath + '/'));
  }

  // If deleted active file, pick another
  if (room.activeFileId === req.params.fileId) {
    room.activeFileId = room.files.find((f) => !f.isFolder)?._id?.toString() || '';
  }

  room.updatedAt = new Date();
  await room.save();
  res.json({ files: room.files, activeFileId: room.activeFileId });
});

// @desc Set active file
// @route PUT /api/rooms/:id/active-file
exports.setActiveFile = asyncHandler(async (req, res) => {
  const { fileId } = req.body;
  const room = await Room.findById(req.params.id);
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  room.activeFileId = fileId;
  await room.save();
  res.json({ activeFileId: room.activeFileId });
});

// ==========================================
// VERSION HISTORY OPERATIONS
// ==========================================

// @desc Get versions timeline for a room
// @route GET /api/rooms/:id/versions
exports.getVersions = asyncHandler(async (req, res) => {
  const versions = await VersionSnapshot.find({ room: req.params.id })
    .populate('author', 'name email avatar')
    .sort({ versionNumber: -1 });

  res.json(versions);
});

// @desc Create manual version snapshot
// @route POST /api/rooms/:id/versions
exports.createVersion = asyncHandler(async (req, res) => {
  const { description } = req.body;
  const room = await Room.findById(req.params.id);
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  const lastVersion = await VersionSnapshot.findOne({ room: room._id }).sort({ versionNumber: -1 });
  const nextVersionNumber = lastVersion ? lastVersion.versionNumber + 1 : 1;

  const snapshot = await VersionSnapshot.create({
    room: room._id,
    versionNumber: nextVersionNumber,
    description: description || `Version ${nextVersionNumber}`,
    author: req.user.id,
    filesSnapshot: room.files.map((f) => ({
      _id: f._id,
      name: f.name,
      path: f.path,
      content: f.content,
      language: f.language,
      isFolder: f.isFolder,
      parentPath: f.parentPath,
    })),
    activeFileId: room.activeFileId,
  });

  room.activityLog.push({
    user: req.user.id,
    action: 'VERSION_SAVED',
    details: `Created snapshot v${nextVersionNumber}: "${description || 'Manual'}"`,
    timestamp: new Date(),
  });
  await room.save();

  const populated = await VersionSnapshot.findById(snapshot._id).populate('author', 'name email avatar');
  res.status(201).json(populated);
});

// @desc Restore previous version snapshot (non-destructive: creates new version before restoring)
// @route POST /api/rooms/:id/versions/:versionId/restore
exports.restoreVersion = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  const targetSnapshot = await VersionSnapshot.findById(req.params.versionId);
  if (!targetSnapshot || targetSnapshot.room.toString() !== room._id.toString()) {
    return res.status(404).json({ message: 'Snapshot not found' });
  }

  // Auto-save current state as a snapshot before rolling back so nothing is lost
  const lastVersion = await VersionSnapshot.findOne({ room: room._id }).sort({ versionNumber: -1 });
  const backupVersionNumber = (lastVersion?.versionNumber || 0) + 1;

  await VersionSnapshot.create({
    room: room._id,
    versionNumber: backupVersionNumber,
    description: `Auto backup before restoring v${targetSnapshot.versionNumber}`,
    author: req.user.id,
    filesSnapshot: room.files,
    activeFileId: room.activeFileId,
  });

  // Restore files from snapshot
  room.files = targetSnapshot.filesSnapshot;
  room.activeFileId = targetSnapshot.activeFileId || room.files[0]?._id?.toString() || '';
  room.code = room.files.find((f) => f._id?.toString() === room.activeFileId)?.content || room.files[0]?.content || '';
  room.updatedAt = new Date();

  room.activityLog.push({
    user: req.user.id,
    action: 'VERSION_RESTORED',
    details: `Restored workspace to v${targetSnapshot.versionNumber}`,
    timestamp: new Date(),
  });

  await room.save();

  const updatedRoom = await Room.findById(room._id)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

  res.json({ message: `Restored to v${targetSnapshot.versionNumber}`, room: updatedRoom });
});

// ==========================================
// MEMBER ROLES & COLLABORATORS
// ==========================================

// @desc Update collaborator role
// @route PUT /api/rooms/:id/members/:memberId/role
exports.updateMemberRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['admin', 'editor', 'viewer'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role specified' });
  }

  const room = await Room.findById(req.params.id);
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  if (room.owner.toString() !== req.user.id.toString()) {
    return res.status(403).json({ message: 'Only the project owner can change member roles' });
  }

  const member = room.members.find(
    (m) => (m.user?._id || m.user).toString() === req.params.memberId
  );
  if (!member) {
    return res.status(404).json({ message: 'Member not found in workspace' });
  }

  member.role = role;
  await room.save();

  res.json({ message: 'Member role updated successfully', members: room.members });
});

// @desc Remove collaborator from room
// @route DELETE /api/rooms/:id/members/:memberId
exports.removeMember = asyncHandler(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  if (room.owner.toString() !== req.user.id.toString()) {
    return res.status(403).json({ message: 'Only the project owner can remove members' });
  }

  room.members = room.members.filter(
    (m) => (m.user?._id || m.user).toString() !== req.params.memberId
  );

  await room.save();
  res.json({ message: 'Member removed', members: room.members });
});

// @desc Duplicate / fork project
// @route POST /api/rooms/:id/duplicate
exports.duplicateRoom = asyncHandler(async (req, res) => {
  const sourceRoom = await Room.findById(req.params.id);
  if (!sourceRoom) {
    return res.status(404).json({ message: 'Source project not found' });
  }

  const newCode = await generateRoomCode();
  const duplicated = await Room.create({
    name: `${sourceRoom.name} (Copy)`,
    description: sourceRoom.description,
    language: sourceRoom.language,
    code: sourceRoom.code,
    files: sourceRoom.files,
    owner: req.user.id,
    members: [{ user: req.user.id, role: 'owner' }],
    roomCode: newCode,
    tags: sourceRoom.tags,
    activityLog: [
      {
        user: req.user.id,
        action: 'PROJECT_FORKED',
        details: `Forked from "${sourceRoom.name}"`,
      },
    ],
  });

  res.status(201).json(duplicated);
});

// ==========================================
// ADVANCED CHAT OPERATIONS
// ==========================================

// @desc Get messages for a room
// @route GET /api/rooms/:id/messages
exports.getRoomMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ room: req.params.id })
    .populate('sender', 'name email avatar')
    .populate({
      path: 'replyTo',
      select: 'text sender codeSnippet',
      populate: { path: 'sender', select: 'name' },
    })
    .sort('createdAt');

  res.json(messages);
});

// @desc Post new chat message
// @route POST /api/rooms/:id/messages
exports.addRoomMessage = asyncHandler(async (req, res) => {
  const { text, codeSnippet, replyTo } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ message: 'Message text is required' });
  }

  const message = await Message.create({
    room: req.params.id,
    sender: req.user.id,
    text: text.trim(),
    codeSnippet: codeSnippet || { code: '', language: '' },
    replyTo: replyTo || null,
  });

  const populated = await Message.findById(message._id)
    .populate('sender', 'name email avatar')
    .populate({
      path: 'replyTo',
      select: 'text sender codeSnippet',
      populate: { path: 'sender', select: 'name' },
    });

  res.status(201).json(populated);
});

// @desc Add or toggle emoji reaction on a message
// @route POST /api/rooms/:id/messages/:messageId/react
exports.toggleReaction = asyncHandler(async (req, res) => {
  const { emoji } = req.body;
  if (!emoji) {
    return res.status(400).json({ message: 'Emoji is required' });
  }

  const message = await Message.findById(req.params.messageId);
  if (!message) {
    return res.status(404).json({ message: 'Message not found' });
  }

  const userIdStr = req.user.id.toString();
  const existingIndex = message.reactions.findIndex(
    (r) => r.emoji === emoji && r.user.toString() === userIdStr
  );

  if (existingIndex > -1) {
    message.reactions.splice(existingIndex, 1);
  } else {
    message.reactions.push({ emoji, user: req.user.id });
  }

  await message.save();
  res.json({ reactions: message.reactions });
});

// @desc Edit message
// @route PUT /api/rooms/:id/messages/:messageId
exports.editMessage = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const message = await Message.findById(req.params.messageId);
  if (!message) {
    return res.status(404).json({ message: 'Message not found' });
  }

  if (message.sender.toString() !== req.user.id.toString()) {
    return res.status(403).json({ message: 'You can only edit your own messages' });
  }

  message.text = text.trim();
  message.isEdited = true;
  await message.save();

  res.json(message);
});

// @desc Delete message
// @route DELETE /api/rooms/:id/messages/:messageId
exports.deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.messageId);
  if (!message) {
    return res.status(404).json({ message: 'Message not found' });
  }

  const room = await Room.findById(req.params.id);
  const isOwner = room && room.owner.toString() === req.user.id.toString();
  const isAuthor = message.sender.toString() === req.user.id.toString();

  if (!isAuthor && !isOwner) {
    return res.status(403).json({ message: 'You do not have permission to delete this message' });
  }

  message.isDeleted = true;
  message.text = 'This message was deleted.';
  await message.save();

  res.json({ message: 'Message marked as deleted', messageId: message._id });
});
