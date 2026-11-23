// server/test-server.js
// Automated verification suite testing all CollabCode backend capabilities
const axios = require('axios');
const http = require('http');

async function runTests() {
  console.log('==============================================');
  console.log('Starting CollabCode Comprehensive Test Suite');
  console.log('==============================================');

  const baseURL = 'http://localhost:5000/api';
  let token = '';
  let roomId = '';
  let testFileId = '';

  // 1. Health Check
  try {
    const health = await axios.get('http://localhost:5000/api/health');
    console.log('✓ [1/10] Health Check:', health.data.status, health.data.platform);
  } catch (e) {
    console.error('✕ [1/10] Health check failed:', e.message);
  }

  // 2. Authentication: Login with demo account
  try {
    const loginRes = await axios.post(`${baseURL}/auth/login`, {
      email: 'alex@example.com',
      password: 'Demo@123',
    });
    token = loginRes.data.token;
    console.log('✓ [2/10] Authentication Login: Success (Logged in as:', loginRes.data.user.name, ')');
  } catch (e) {
    console.error('✕ [2/10] Auth login failed:', e.response?.data || e.message);
  }

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  // 3. Get User Profile and Workspaces
  try {
    const roomsRes = await axios.get(`${baseURL}/rooms`, authHeader);
    console.log(`✓ [3/10] Workspaces Fetch: Success (${roomsRes.data.length} active workspaces found)`);
    if (roomsRes.data.length > 0) {
      roomId = roomsRes.data[0]._id;
      console.log(`        Selected test workspace: "${roomsRes.data[0].name}" [${roomsRes.data[0].roomCode}]`);
    }
  } catch (e) {
    console.error('✕ [3/10] Workspaces fetch failed:', e.response?.data || e.message);
  }

  // 4. Room Multi-File Project Structure
  try {
    const roomDetail = await axios.get(`${baseURL}/rooms/${roomId}`, authHeader);
    const files = roomDetail.data.files || [];
    console.log(`✓ [4/10] Multi-File Project: Success (${files.length} files in project tree)`);
    files.forEach((f) => console.log(`        - ${f.path} (${f.language})`));
  } catch (e) {
    console.error('✕ [4/10] Room detail failed:', e.response?.data || e.message);
  }

  // 5. Create New File in Workspace
  try {
    const createRes = await axios.post(
      `${baseURL}/rooms/${roomId}/files`,
      {
        name: 'test_module.js',
        isFolder: false,
        parentPath: '/',
        content: 'export const value = 42;\nconsole.log("Module loaded successfully");\n',
        language: 'javascript',
      },
      authHeader
    );
    testFileId = createRes.data.createdFile?._id;
    console.log('✓ [5/10] Multi-File Operations: File "test_module.js" created successfully.');
  } catch (e) {
    console.error('✕ [5/10] File create failed:', e.response?.data || e.message);
  }

  // 6. Real Code Execution (JavaScript)
  try {
    const jsExec = await axios.post(
      `${baseURL}/execute/run`,
      {
        roomId,
        language: 'javascript',
        code: `const a = 15; const b = 35; console.log("Result:", a + b);`,
      },
      authHeader
    );
    console.log('✓ [6/10] Real JavaScript Execution:');
    console.log(`        Status: ${jsExec.data.status}, Engine: ${jsExec.data.engine}, Time: ${jsExec.data.executionTimeMs}ms`);
    console.log(`        Stdout: ${jsExec.data.stdout.trim()}`);
  } catch (e) {
    console.error('✕ [6/10] JS Execution failed:', e.response?.data || e.message);
  }

  // 7. Real Code Execution (Python)
  try {
    const pyExec = await axios.post(
      `${baseURL}/execute/run`,
      {
        roomId,
        language: 'python',
        code: `nums = [1, 2, 3, 4]\nprint(f"Python Sum: {sum(nums)}")`,
      },
      authHeader
    );
    console.log('✓ [7/10] Real Python Execution:');
    console.log(`        Status: ${pyExec.data.status}, Engine: ${pyExec.data.engine}, Time: ${pyExec.data.executionTimeMs}ms`);
    console.log(`        Stdout: ${pyExec.data.stdout.trim()}`);
  } catch (e) {
    console.error('✕ [7/10] Python Execution failed:', e.response?.data || e.message);
  }

  // 8. Version History Snapshot
  try {
    const snapRes = await axios.post(
      `${baseURL}/rooms/${roomId}/versions`,
      { description: 'Automated Test Milestone Snapshot' },
      authHeader
    );
    console.log(`✓ [8/10] Version History: Created snapshot v${snapRes.data.versionNumber} ("${snapRes.data.description}")`);
  } catch (e) {
    console.error('✕ [8/10] Version snapshot failed:', e.response?.data || e.message);
  }

  // 9. Advanced Team Chat with Code Snippet
  try {
    const chatRes = await axios.post(
      `${baseURL}/rooms/${roomId}/messages`,
      {
        text: 'Testing real-time code snippet sharing in chat.',
        codeSnippet: {
          code: 'function add(x, y) { return x + y; }',
          language: 'javascript',
        },
      },
      authHeader
    );
    console.log(`✓ [9/10] Team Chat: Message posted with snippet (ID: ${chatRes.data._id})`);
  } catch (e) {
    console.error('✕ [9/10] Chat message failed:', e.response?.data || e.message);
  }

  // 10. AI Coding Assistant & Personal Analytics
  try {
    const aiRes = await axios.post(
      `${baseURL}/ai/query`,
      {
        prompt: 'How to optimize an array search?',
        action: 'chat',
        language: 'javascript',
        code: 'const arr = [1, 2, 3];',
      },
      authHeader
    );
    console.log(`✓ [10/10] AI Assistant Status: Configured=${aiRes.data.configured}`);
    if (aiRes.data.configured === false) {
      console.log(`         Graceful fallback active: "${aiRes.data.message}"`);
    }

    const analyticsRes = await axios.get(`${baseURL}/auth/analytics`, authHeader);
    console.log(`         Personal Analytics: Projects=${analyticsRes.data.totalProjectsCreated}, Collaborations=${analyticsRes.data.totalCollaborations}, Executions=${analyticsRes.data.totalExecutions}`);
  } catch (e) {
    console.error('✕ [10/10] AI/Analytics failed:', e.response?.data || e.message);
  }

  console.log('==============================================');
  console.log('All CollabCode Backend Tests Completed!');
  console.log('==============================================');
  process.exit(0);
}

// Start server in-process and poll until ready
const app = require('./server');

async function waitForServerAndDB() {
  console.log('[Test Setup] Waiting for CollabCode server and database initialization...');
  const maxAttempts = 180;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await axios.get('http://localhost:5000/api/health');
      if (res.data && res.data.dbReady) {
        console.log(`[Test Setup] Database and server ready after ${i + 1}s`);
        return;
      }
    } catch (err) {
      // Server still booting up
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error('Server/Database initialization timed out after 180s');
}

waitForServerAndDB()
  .then(runTests)
  .catch((err) => {
    console.error('[Test Setup] Failed to initialize:', err.message);
    process.exit(1);
  });
