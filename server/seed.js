// server/seed.js – Seed database with realistic developer users, rooms, and conversations
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');

const User = require('./models/User');
const Room = require('./models/Room');
const Message = require('./models/Message');
const VersionSnapshot = require('./models/VersionSnapshot');

const seedData = async () => {
  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Room.deleteMany({}),
    Message.deleteMany({}),
    VersionSnapshot.deleteMany({}),
  ]);

  // 1. Create Demo Users (password for all demo users: Demo@123)
  const usersData = [
    {
      name: 'Alex Johnson',
      email: 'alex@example.com',
      password: 'Demo@123',
      bio: 'Senior Fullstack Engineer & Open Source Contributor',
      programmingInterests: ['JavaScript', 'Node.js', 'React', 'Python'],
      preferredLanguage: 'javascript',
    },
    {
      name: 'Priya Sharma',
      email: 'priya@example.com',
      password: 'Demo@123',
      bio: 'Algorithm Specialist & Backend Architect',
      programmingInterests: ['Python', 'C++', 'Algorithms', 'Distributed Systems'],
      preferredLanguage: 'python',
    },
    {
      name: 'Rohan Mehta',
      email: 'rohan@example.com',
      password: 'Demo@123',
      bio: 'Frontend Performance Engineer',
      programmingInterests: ['JavaScript', 'TypeScript', 'React', 'CSS'],
      preferredLanguage: 'javascript',
    },
    {
      name: 'Sneha Kulkarni',
      email: 'sneha@example.com',
      password: 'Demo@123',
      bio: 'Systems Programmer & C++ Enthusiast',
      programmingInterests: ['C++', 'C', 'Rust', 'Linux'],
      preferredLanguage: 'cpp',
    },
    {
      name: 'Arjun Nair',
      email: 'arjun@example.com',
      password: 'Demo@123',
      bio: 'Junior Developer & CS Student',
      programmingInterests: ['Java', 'Python', 'Web Dev'],
      preferredLanguage: 'python',
    },
    {
      name: 'Meera Iyer',
      email: 'meera@example.com',
      password: 'Demo@123',
      bio: 'Cloud Architect & API Developer',
      programmingInterests: ['Node.js', 'Go', 'Docker', 'React'],
      preferredLanguage: 'javascript',
    },
  ];

  const createdUsers = {};
  for (const u of usersData) {
    const userDoc = await User.create(u);
    createdUsers[u.email] = userDoc;
  }

  const alex = createdUsers['alex@example.com'];
  const priya = createdUsers['priya@example.com'];
  const rohan = createdUsers['rohan@example.com'];
  const sneha = createdUsers['sneha@example.com'];
  const arjun = createdUsers['arjun@example.com'];
  const meera = createdUsers['meera@example.com'];

  // Helper for unique codes
  const usedCodes = new Set();
  const genCode = (prefix = '') => {
    let code = '';
    do {
      code = (prefix + Math.random().toString(36).substring(2, 8)).substring(0, 6).toUpperCase();
    } while (usedCodes.has(code) || code.length !== 6);
    usedCodes.add(code);
    return code;
  };

  // 2. Define Rooms with Multi-file structures
  const roomsData = [
    // 1. Python Algorithm Practice
    {
      name: 'Algorithm Practice - Python',
      description: 'Optimized algorithmic data structure exercises and pair programming in Python.',
      language: 'python',
      roomCode: 'PYTH01',
      owner: alex._id,
      members: [
        { user: alex._id, role: 'owner' },
        { user: priya._id, role: 'admin' },
        { user: arjun._id, role: 'editor' },
      ],
      tags: ['algorithms', 'python', 'leetcode'],
      files: [
        {
          name: 'two_sum.py',
          path: '/two_sum.py',
          content: `# Algorithm Practice - Python
# Two Sum Problem (O(n) single-pass hash map solution)

def two_sum(nums, target):
    """
    Find two numbers in the list that sum to target.
    Returns their 0-based indices.
    """
    lookup = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in lookup:
            return [lookup[complement], i]
        lookup[num] = i
    return []

# Test execution
if __name__ == "__main__":
    nums = [2, 7, 11, 15]
    target = 9
    indices = two_sum(nums, target)
    print("========================================")
    print("    Python Algorithm Practice Runner    ")
    print("========================================")
    print(f"Target Sum: {target}")
    print(f"Found Indices: {indices}")
    print(f"Values: {nums[indices[0]]} + {nums[indices[1]]} = {target}")
    print("Algorithm execution verified successfully!")
`,
          language: 'python',
          isFolder: false,
        },
        {
          name: 'algorithms/binary_search.py',
          path: '/algorithms/binary_search.py',
          content: `# Binary Search Algorithm O(log n)
def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1
`,
          language: 'python',
          isFolder: false,
        },
        {
          name: 'utils/data_generator.py',
          path: '/utils/data_generator.py',
          content: `# Benchmark dataset generator
def generate_dataset(size=1000):
    return [i * 3 for i in range(size)]
`,
          language: 'python',
          isFolder: false,
        },
        {
          name: 'test_cases.py',
          path: '/test_cases.py',
          content: `# Test cases for algorithms
from two_sum import two_sum

def test():
    assert two_sum([2, 7, 11, 15], 9) == [0, 1]
    assert two_sum([3, 2, 4], 6) == [1, 2]
    assert two_sum([3, 3], 6) == [0, 1]
    print("All unit tests passed successfully!")

if __name__ == "__main__":
    test()
`,
          language: 'python',
          isFolder: false,
        },
        {
          name: 'README.md',
          path: '/README.md',
          content: `# Algorithm Practice - Python
Contains solutions for classic algorithm problems.
- Time Complexity: O(n)
- Space Complexity: O(n)
`,
          language: 'markdown',
          isFolder: false,
        },
      ],
    },

    // 2. JS Fundamentals
    {
      name: 'JS Fundamentals & Closures',
      description: 'In-depth exploration of JavaScript lexical scoping, closures, and modern functional methods.',
      language: 'javascript',
      roomCode: 'JSFUND',
      owner: rohan._id,
      members: [
        { user: rohan._id, role: 'owner' },
        { user: sneha._id, role: 'editor' },
        { user: arjun._id, role: 'viewer' },
      ],
      tags: ['javascript', 'closures', 'es6'],
      files: [
        {
          name: 'index.js',
          path: '/index.js',
          content: `// JS Fundamentals: Closures, Counter Factory & Array Methods

// 1. Closure: Counter Factory encapsulating private state
function createCounter(initialValue = 0) {
  let count = initialValue;

  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count,
    reset: () => {
      count = initialValue;
      return count;
    }
  };
}

const counterA = createCounter(10);
console.log("Counter A (+1):", counterA.increment()); // 11
console.log("Counter A (+1):", counterA.increment()); // 12
console.log("Counter A (-1):", counterA.decrement()); // 11

// 2. Array Methods
const developers = [
  { name: "Rohan", yearsExp: 4, role: "Fullstack" },
  { name: "Sneha", yearsExp: 6, role: "Frontend" },
  { name: "Arjun", yearsExp: 2, role: "Junior Dev" },
  { name: "Meera", yearsExp: 5, role: "Backend" }
];

const totalExp = developers.reduce((acc, dev) => acc + dev.yearsExp, 0);
console.log("Total team experience:", totalExp, "years");
`,
          language: 'javascript',
          isFolder: false,
        },
        {
          name: 'src/debounce.js',
          path: '/src/debounce.js',
          content: `// Reusable debounce utility function
export function debounce(fn, delay = 300) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
`,
          language: 'javascript',
          isFolder: false,
        },
        {
          name: 'src/memoize.js',
          path: '/src/memoize.js',
          content: `// Function memoization helper
export function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}
`,
          language: 'javascript',
          isFolder: false,
        },
        {
          name: 'package.json',
          path: '/package.json',
          content: JSON.stringify({ name: 'js-fundamentals', version: '1.0.0', type: 'module' }, null, 2),
          language: 'json',
          isFolder: false,
        },
      ],
    },

    // 3. C++ High-Performance Workspace
    {
      name: 'C++ Data Structures Lab',
      description: 'Benchmarking custom vectors, binary trees, and memory management in C++.',
      language: 'cpp',
      roomCode: 'CPPLAB',
      owner: sneha._id,
      members: [
        { user: sneha._id, role: 'owner' },
        { user: priya._id, role: 'admin' },
        { user: alex._id, role: 'editor' },
      ],
      tags: ['cpp', 'stl', 'systems'],
      files: [
        {
          name: 'main.cpp',
          path: '/main.cpp',
          content: `// C++ Data Structures Lab - Main Benchmark Execution
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
          name: 'src/benchmarks.cpp',
          path: '/src/benchmarks.cpp',
          content: `// High-resolution benchmark utilities
#include <iostream>
#include <chrono>

void runBenchmark() {
    std::cout << "Benchmark harness loaded." << std::endl;
}
`,
          language: 'cpp',
          isFolder: false,
        },
        {
          name: 'README.md',
          path: '/README.md',
          content: `# C++ Data Structures Lab
Benchmarking custom vectors, binary search trees, and memory management in C++.
`,
          language: 'markdown',
          isFolder: false,
        },
      ],
    },

    // 4. Java Object-Oriented Lab
    {
      name: 'Java OOP & Design Patterns',
      description: 'Factory pattern, Singleton, and Observer implementations in Java 25.',
      language: 'java',
      roomCode: 'JAVA01',
      owner: arjun._id,
      members: [
        { user: arjun._id, role: 'owner' },
        { user: alex._id, role: 'editor' },
      ],
      tags: ['java', 'oop', 'design-patterns'],
      files: [
        {
          name: 'Main.java',
          path: '/Main.java',
          content: `// Java OOP & Design Patterns Main Runner
import java.util.*;

// 1. Singleton Pattern
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

// 2. Factory Pattern
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
          content: `// Singleton Implementation with Double-Checked Locking
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
          content: `# Java OOP & Design Patterns
Enterprise Java workspace demonstrating Singleton, Factory, and Observer design patterns.
`,
          language: 'markdown',
          isFolder: false,
        },
      ],
    },
  ];

  const createdRooms = [];
  for (const r of roomsData) {
    r.code = r.files[0]?.content || '';
    const roomDoc = await Room.create(r);
    if (roomDoc.files.length > 0) {
      roomDoc.activeFileId = roomDoc.files[0]._id.toString();
      await roomDoc.save();
    }

    // Version Snapshot v1
    await VersionSnapshot.create({
      room: roomDoc._id,
      versionNumber: 1,
      description: 'Initial template setup',
      author: roomDoc.owner,
      filesSnapshot: roomDoc.files,
      activeFileId: roomDoc.activeFileId,
    });

    createdRooms.push(roomDoc);
  }

  // 3. Seed Realistic Chat Messages Across All Rooms
  const now = Date.now();
  const hoursAgo = (h) => new Date(now - h * 3600 * 1000);

  // Helper to create message with populated reply and reactions
  const seedMessagesForRoom = async (roomDoc, msgsList) => {
    const createdMap = {};
    for (const m of msgsList) {
      const msgData = {
        room: roomDoc._id,
        sender: m.sender._id,
        text: m.text,
        createdAt: m.createdAt,
        codeSnippet: m.codeSnippet || { code: '', language: '' },
        reactions: m.reactions
          ? m.reactions.map((r) => ({ emoji: r.emoji, user: r.user._id }))
          : [],
        replyTo: m.replyKey ? createdMap[m.replyKey] : null,
      };
      const created = await Message.create(msgData);
      if (m.key) {
        createdMap[m.key] = created._id;
      }
    }
  };

  // 1. Python Algorithm Practice Messages
  await seedMessagesForRoom(createdRooms[0], [
    {
      sender: alex,
      text: "Welcome to the Python room! Let's solve Two Sum and Graph Traversals efficiently.",
      createdAt: hoursAgo(42),
    },
    {
      key: 'py-hashmap',
      sender: priya,
      text: 'Single-pass hash map gives us O(n) runtime and O(n) auxiliary memory. Here is the core logic:',
      createdAt: hoursAgo(36),
      codeSnippet: {
        code: `def two_sum(nums, target):\n    lookup = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in lookup:\n            return [lookup[complement], i]\n        lookup[num] = i\n    return []`,
        language: 'python',
      },
    },
    {
      sender: arjun,
      replyKey: 'py-hashmap',
      text: 'Tested this with negative numbers and duplicate values. Passed in 34ms with zero edge-case errors!',
      createdAt: hoursAgo(24),
    },
    {
      sender: sneha,
      text: "I've added grid-based DFS traversal in algorithms/dfs.py. Check out the boundary checks.",
      createdAt: hoursAgo(10),
    },
    {
      sender: priya,
      text: 'Great work! All test suites pass. Ready for our team code review.',
      createdAt: hoursAgo(2),
    },
  ]);

  // 2. JavaScript Fundamentals & Closures Messages
  await seedMessagesForRoom(createdRooms[1], [
    {
      sender: rohan,
      text: 'Welcome to the JS workspace! We are implementing core design utilities with zero runtime dependencies.',
      createdAt: hoursAgo(38),
    },
    {
      key: 'js-debounce',
      sender: alex,
      text: 'Here is the debounced execution handler with automatic timer clearance:',
      createdAt: hoursAgo(30),
      codeSnippet: {
        code: `export function debounce(fn, delay = 300) {\n  let timer = null;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n}`,
        language: 'javascript',
      },
    },
    {
      sender: rohan,
      replyKey: 'js-debounce',
      text: 'Integrated this into the search filter input! Dramatically cut down redundant re-renders.',
      createdAt: hoursAgo(18),
    },
    {
      sender: sneha,
      text: 'Private state inside closure factory functions is so much cleaner than prototype hacks.',
      createdAt: hoursAgo(8),
    },
    {
      sender: alex,
      text: 'Snapshot v2 has been saved. Feel free to refactor without fear of losing working code!',
      createdAt: hoursAgo(1),
    },
  ]);

  // 3. C++ Data Structures Lab Messages
  await seedMessagesForRoom(createdRooms[2], [
    {
      sender: sneha,
      text: 'Starting our custom Dynamic Vector implementation to benchmark against std::vector under heavy allocations.',
      createdAt: hoursAgo(44),
    },
    {
      key: 'cpp-realloc',
      sender: sneha,
      text: 'Implemented dynamic reallocation with move semantics for optimal throughput:',
      createdAt: hoursAgo(32),
      codeSnippet: {
        code: `template <typename T>\nvoid CustomVector<T>::reallocate(size_t newCap) {\n    T* newBlock = new T[newCap];\n    for (size_t i = 0; i < m_size; ++i) {\n        newBlock[i] = std::move(m_data[i]);\n    }\n    delete[] m_data;\n    m_data = newBlock;\n    m_capacity = newCap;\n}`,
        language: 'cpp',
      },
    },
    {
      sender: arjun,
      replyKey: 'cpp-realloc',
      text: 'Benchmarked with 100,000 push_back operations: elapsed time was 1.4ms on GCC with -O3 flags!',
      createdAt: hoursAgo(20),
    },
    {
      sender: priya,
      text: 'Make sure we check for allocation exceptions when requesting extremely large capacities.',
      createdAt: hoursAgo(9),
    },
    {
      sender: alex,
      text: 'Memory checks completed with Valgrind: 0 bytes in 0 blocks definitively lost.',
      createdAt: hoursAgo(3),
    },
  ]);

  // 4. Java OOP & Design Patterns Messages
  await seedMessagesForRoom(createdRooms[3], [
    {
      sender: arjun,
      text: 'Java OOP & Gang of Four Design Patterns workspace is ready! Starting with Creational patterns.',
      createdAt: hoursAgo(46),
    },
    {
      key: 'java-singleton',
      sender: arjun,
      text: 'Here is the thread-safe Database Connection Singleton using double-checked locking:',
      createdAt: hoursAgo(34),
      codeSnippet: {
        code: `public class DatabaseConnection {\n    private static volatile DatabaseConnection instance;\n    private DatabaseConnection() {}\n    public static DatabaseConnection getInstance() {\n        if (instance == null) {\n            synchronized (DatabaseConnection.class) {\n                if (instance == null) instance = new DatabaseConnection();\n            }\n        }\n        return instance;\n    }\n}`,
        language: 'java',
      },
    },
    {
      sender: priya,
      replyKey: 'java-singleton',
      text: 'The volatile keyword is essential here to prevent CPU instruction reordering. Excellent implementation!',
      createdAt: hoursAgo(22),
    },
    {
      sender: alex,
      text: 'Can we build the Notification Factory next for SMS, Email, and Push channels?',
      createdAt: hoursAgo(11),
    },
    {
      sender: arjun,
      text: 'Just finished NotificationFactory! Run Main.java to see the factory output in the bottom terminal.',
      createdAt: hoursAgo(2),
    },
  ]);

  console.log(`[Seed] Seeded ${usersData.length} users and ${createdRooms.length} rooms successfully.`);
};

// If run directly via CLI
if (require.main === module) {
  const connectDB = require('./config/db');
  connectDB().then(async () => {
    await seedData();
    process.exit(0);
  }).catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}

module.exports = { seedData };
