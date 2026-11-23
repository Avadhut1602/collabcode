// server/controllers/executionController.js
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const ExecutionLog = require('../models/ExecutionLog');
const Room = require('../models/Room');

const PISTON_API_URL = process.env.PISTON_API_URL || 'https://emkc.org/api/v2/piston/execute';

// Language aliases and Piston language configurations
const LANGUAGE_CONFIG = {
  javascript: { pistonLang: 'javascript', pistonVersion: '18.15.0', ext: 'js' },
  js: { pistonLang: 'javascript', pistonVersion: '18.15.0', ext: 'js' },
  python: { pistonLang: 'python', pistonVersion: '3.10.0', ext: 'py' },
  py: { pistonLang: 'python', pistonVersion: '3.10.0', ext: 'py' },
  cpp: { pistonLang: 'c++', pistonVersion: '10.2.0', ext: 'cpp' },
  'c++': { pistonLang: 'c++', pistonVersion: '10.2.0', ext: 'cpp' },
  c: { pistonLang: 'c', pistonVersion: '10.2.0', ext: 'c' },
  java: { pistonLang: 'java', pistonVersion: '15.0.2', ext: 'java' },
};

// Local sandboxed execution for Node, Python, Java, C, and C++
const { spawnSync } = require('child_process');

// Compiler and runtime path resolvers for Windows host
const getToolPaths = (langKey) => {
  if (langKey === 'java') {
    const defaultJavac = 'C:\\Program Files\\Java\\jdk-25.0.2\\bin\\javac.exe';
    const defaultJava = 'C:\\Program Files\\Java\\jdk-25.0.2\\bin\\java.exe';
    return {
      compiler: fs.existsSync(defaultJavac) ? defaultJavac : 'javac',
      runner: fs.existsSync(defaultJava) ? defaultJava : 'java',
    };
  }
  if (langKey === 'cpp' || langKey === 'c++') {
    const defaultGpp = 'C:\\Program Files (x86)\\Dev-Cpp\\MinGW64\\bin\\g++.exe';
    return {
      compiler: fs.existsSync(defaultGpp) ? defaultGpp : 'g++',
      runner: null,
    };
  }
  if (langKey === 'c') {
    const defaultGcc = 'C:\\Program Files (x86)\\Dev-Cpp\\MinGW64\\bin\\gcc.exe';
    return {
      compiler: fs.existsSync(defaultGcc) ? defaultGcc : 'gcc',
      runner: null,
    };
  }
  if (langKey === 'python' || langKey === 'py') {
    const defaultPy = 'C:\\Users\\AVADHUT DHOTRE\\AppData\\Local\\Programs\\Python\\Python313\\python.exe';
    return {
      compiler: null,
      runner: fs.existsSync(defaultPy) ? defaultPy : 'python',
    };
  }
  return {
    compiler: null,
    runner: 'node',
  };
};

const executeLocally = (langKey, code, stdin = '', timeoutMs = 7000) => {
  return new Promise((resolve) => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'collabcode-exec-'));
    const tools = getToolPaths(langKey);
    const startTime = Date.now();

    let runnerCommand = '';
    let runnerArgs = [];

    try {
      // 1. JAVA EXECUTION
      if (langKey === 'java') {
        const classMatch = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
        const className = classMatch ? classMatch[1] : 'Main';
        const javaFile = path.join(tempDir, `${className}.java`);
        fs.writeFileSync(javaFile, code);

        // Compile Java source
        const compile = spawnSync(tools.compiler, [`${className}.java`], {
          cwd: tempDir,
          encoding: 'utf-8',
          timeout: 8000,
          windowsHide: true,
        });

        if (compile.status !== 0 || compile.error) {
          const compileErr = compile.stderr || compile.stdout || compile.error?.message || 'Compilation error';
          fs.rmSync(tempDir, { recursive: true, force: true });
          return resolve({
            success: false,
            status: 'compilation_error',
            stdout: '',
            stderr: `[Java Compilation Error]\n${compileErr}`,
            executionTimeMs: Date.now() - startTime,
          });
        }

        runnerCommand = tools.runner;
        runnerArgs = ['-cp', '.', className];
      }
      // 2. C++ EXECUTION
      else if (langKey === 'cpp' || langKey === 'c++') {
        const cppFile = path.join(tempDir, 'main.cpp');
        fs.writeFileSync(cppFile, code);

        const compile = spawnSync(tools.compiler, ['-O2', 'main.cpp', '-o', 'program.exe'], {
          cwd: tempDir,
          encoding: 'utf-8',
          timeout: 8000,
          windowsHide: true,
        });

        if (compile.status !== 0 || compile.error) {
          const compileErr = compile.stderr || compile.stdout || compile.error?.message || 'Compilation error';
          fs.rmSync(tempDir, { recursive: true, force: true });
          return resolve({
            success: false,
            status: 'compilation_error',
            stdout: '',
            stderr: `[C++ Compilation Error]\n${compileErr}`,
            executionTimeMs: Date.now() - startTime,
          });
        }

        runnerCommand = path.join(tempDir, 'program.exe');
        runnerArgs = [];
      }
      // 3. C EXECUTION
      else if (langKey === 'c') {
        const cFile = path.join(tempDir, 'main.c');
        fs.writeFileSync(cFile, code);

        const compile = spawnSync(tools.compiler, ['-O2', 'main.c', '-o', 'program.exe'], {
          cwd: tempDir,
          encoding: 'utf-8',
          timeout: 8000,
          windowsHide: true,
        });

        if (compile.status !== 0 || compile.error) {
          const compileErr = compile.stderr || compile.stdout || compile.error?.message || 'Compilation error';
          fs.rmSync(tempDir, { recursive: true, force: true });
          return resolve({
            success: false,
            status: 'compilation_error',
            stdout: '',
            stderr: `[C Compilation Error]\n${compileErr}`,
            executionTimeMs: Date.now() - startTime,
          });
        }

        runnerCommand = path.join(tempDir, 'program.exe');
        runnerArgs = [];
      }
      // 4. PYTHON EXECUTION
      else if (langKey === 'python' || langKey === 'py') {
        const pyFile = path.join(tempDir, 'script.py');
        fs.writeFileSync(pyFile, code);
        runnerCommand = tools.runner;
        runnerArgs = ['-u', 'script.py'];
      }
      // 5. JAVASCRIPT EXECUTION
      else {
        const jsFile = path.join(tempDir, 'script.js');
        fs.writeFileSync(jsFile, code);
        runnerCommand = 'node';
        runnerArgs = ['script.js'];
      }
    } catch (prepErr) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      return resolve({
        success: false,
        status: 'error',
        stdout: '',
        stderr: `Execution preparation failed: ${prepErr.message}`,
        executionTimeMs: 0,
      });
    }

    let stdout = '';
    let stderr = '';
    let isKilled = false;

    let child;
    try {
      child = spawn(runnerCommand, runnerArgs, {
        cwd: tempDir,
        env: { ...process.env, NODE_OPTIONS: '--max-old-space-size=128' },
        windowsHide: true,
      });
    } catch (spawnErr) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      return resolve({
        success: false,
        status: 'error',
        stdout: '',
        stderr: `Failed to spawn process (${runnerCommand}): ${spawnErr.message}`,
        executionTimeMs: 0,
      });
    }

    const timeout = setTimeout(() => {
      isKilled = true;
      try {
        child.kill('SIGKILL');
      } catch (e) {}
    }, timeoutMs);

    if (stdin && child.stdin) {
      try {
        child.stdin.write(stdin);
        child.stdin.end();
      } catch (e) {}
    } else if (child.stdin) {
      child.stdin.end();
    }

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('error', (err) => {
      clearTimeout(timeout);
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (e) {}
      resolve({
        success: false,
        status: 'error',
        stdout,
        stderr: `Runtime execution error: ${err.message}`,
        executionTimeMs: Date.now() - startTime,
      });
    });

    child.on('close', (exitCode) => {
      clearTimeout(timeout);
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (e) {}

      const executionTimeMs = Date.now() - startTime;
      if (isKilled) {
        return resolve({
          success: false,
          status: 'timeout',
          stdout,
          stderr: `Execution timed out after ${timeoutMs / 1000} seconds.`,
          executionTimeMs,
        });
      }

      const success = exitCode === 0 && !stderr;
      resolve({
        success,
        status: exitCode === 0 ? 'success' : 'error',
        stdout,
        stderr: stderr || (exitCode !== 0 ? `Process exited with code ${exitCode}` : ''),
        executionTimeMs,
      });
    });
  });
};

// @desc Run user code in sandboxed engine
// @route POST /api/execute/run
exports.runCode = async (req, res) => {
  const { language, code, stdin, roomId } = req.body;

  if (!language || typeof code !== 'string') {
    return res.status(400).json({ message: 'Language and code are required' });
  }

  const langKey = language.toLowerCase().trim();
  const config = LANGUAGE_CONFIG[langKey];

  if (!config) {
    return res.status(400).json({
      success: false,
      status: 'unsupported',
      message: `Language "${language}" is not supported. Supported: JavaScript, Python, C, C++, Java.`,
    });
  }

  const startTime = Date.now();
  let result = null;

  // 1. Try Piston Execution Engine
  try {
    const pistonPayload = {
      language: config.pistonLang,
      version: config.pistonVersion,
      files: [
        {
          name: langKey === 'java' ? 'Main.java' : `main.${config.ext}`,
          content: code,
        },
      ],
      stdin: stdin || '',
      run_timeout: 6000,
      compile_timeout: 10000,
    };

    const response = await axios.post(PISTON_API_URL, pistonPayload, { timeout: 12000 });
    const { run, compile } = response.data;

    const compileErr = compile && compile.stderr ? compile.stderr : '';
    const runErr = run && run.stderr ? run.stderr : '';
    const stdout = (run && run.stdout) || (compile && compile.stdout) || '';
    const stderr = compileErr ? `[Compilation Error]\n${compileErr}` : runErr;

    const executionTimeMs = Date.now() - startTime;
    const isError = Boolean(compileErr) || (run && run.code !== 0);

    result = {
      success: !isError,
      status: compileErr ? 'compilation_error' : isError ? 'error' : 'success',
      stdout,
      stderr,
      executionTimeMs,
      exitCode: run ? run.code : compile ? compile.code : 0,
      engine: 'Piston Sandboxed API',
    };
  } catch (apiErr) {
    console.warn(`[Execution] Piston API request failed (${apiErr.message}). Attempting local isolated fallback...`);

    // 2. Fallback to local compiler/runtime for all supported languages (Java, C, C++, Python, JS)
    const localResult = await executeLocally(langKey, code, stdin, 8000);
    result = {
      ...localResult,
      engine: 'Local Host Sandbox',
    };
  }

  // 3. Log execution into MongoDB
  try {
    await ExecutionLog.create({
      room: roomId || null,
      user: req.user.id,
      language: langKey,
      code,
      stdin: stdin || '',
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      status: result.status,
      executionTimeMs: result.executionTimeMs,
    });
  } catch (logErr) {
    console.error('[ExecutionLog] Failed to persist log:', logErr.message);
  }

  res.json(result);
};

// @desc Get execution history for room
// @route GET /api/execute/history/:roomId
exports.getExecutionHistory = async (req, res) => {
  try {
    const history = await ExecutionLog.find({ room: req.params.roomId })
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch execution history' });
  }
};
