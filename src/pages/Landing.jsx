// src/pages/Landing.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Code2,
  Zap,
  FolderTree,
  Play,
  Bot,
  History,
  MessageSquare,
  Users,
  ChevronRight,
  ChevronDown,
  Check,
  Sparkles,
  Shield,
  Layers,
  ArrowRight,
  Terminal,
  Cpu,
} from 'lucide-react';
import './Landing.css';

const CURRENT_YEAR = new Date().getFullYear();

// Code preview snippet for interactive hero
const PREVIEW_CODE = `// CollabCode Live Collaborative Session
import { solveOptimalPath } from './algorithms.js';

export function runDemo() {
  const dataset = [12, 45, 68, 92, 104];
  const target = 160;
  
  // Real-time simultaneous execution
  console.log("Evaluating target sum:", target);
  const result = solveOptimalPath(dataset, target);
  return \`Optimal indices: [\${result.join(', ')}]\`;
}

console.log(runDemo());`;

export default function Landing() {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(null);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isRunningHero, setIsRunningHero] = useState(false);
  const [heroOutput, setHeroOutput] = useState('Console ready. Click ▶ Run to execute.');

  const handleRunHero = () => {
    setIsRunningHero(true);
    setHeroOutput('Executing script in sandboxed runner...');
    setTimeout(() => {
      setIsRunningHero(false);
      setHeroOutput(`Evaluating target sum: 160\nOptimal indices: [1, 2, 4]\n\n[Process completed successfully in 42ms with exit code 0]`);
    }, 600);
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    navigate(`/dashboard?join=${joinCodeInput.trim().toUpperCase()}`);
  };

  const toggleFaq = (index) => {
    setActiveFaq((prev) => (prev === index ? null : index));
  };

  const features = [
    {
      icon: <Zap size={24} className="feat-icon-svg text-amber" />,
      title: 'Real-Time WebSocket Sync',
      desc: 'Collaborate with teammates simultaneously with zero lag, instant file updates, and live cursors powered by Socket.IO.',
    },
    {
      icon: <FolderTree size={24} className="feat-icon-svg text-blue" />,
      title: 'Multi-File VS Code Explorer',
      desc: 'Create, organize, rename, and manage complex project trees with tabs, search, and support for 12+ file extensions.',
    },
    {
      icon: <Play size={24} className="feat-icon-svg text-emerald" />,
      title: 'Actual Multi-Language Execution',
      desc: 'Execute JavaScript, Python, C, C++, and Java in isolated sandboxes with stdin support, runtime stats, and compiler errors.',
    },
    {
      icon: <Bot size={24} className="feat-icon-svg text-purple" />,
      title: 'Integrated AI Coding Assistant',
      desc: 'Explain code, detect subtle edge-case bugs, optimize Big-O complexity, generate unit tests, and convert code seamlessly.',
    },
    {
      icon: <History size={24} className="feat-icon-svg text-cyan" />,
      title: 'Version History & Diffs',
      desc: 'Save manual & automated snapshots, inspect side-by-side colorized diffs, and perform safe non-destructive rollbacks.',
    },
    {
      icon: <MessageSquare size={24} className="feat-icon-svg text-pink" />,
      title: 'Advanced Team Chat & Snippets',
      desc: 'Threaded discussions, emoji reactions, syntax-highlighted code sharing, and typing indicators directly inside your workspace.',
    },
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Create or Fork Workspace',
      desc: 'Choose from JavaScript, Python, C++, Java, or custom templates to initialize a multi-file project instantly.',
    },
    {
      step: '02',
      title: 'Invite Teammates Instantly',
      desc: 'Share a 6-character room code or secure invitation link with role-based access (Owner, Admin, Editor, Viewer).',
    },
    {
      step: '03',
      title: 'Pair-Program in Real-Time',
      desc: 'Write code together with visible colored cursors, synchronized file tabs, and integrated team discussion.',
    },
    {
      step: '04',
      title: 'Execute, Debug & AI-Optimize',
      desc: 'Run scripts with standard input, inspect compiler diagnostics, and prompt the AI assistant for instant reviews.',
    },
  ];

  const techStack = [
    { name: 'React 19', role: 'Frontend UI', tag: 'Client' },
    { name: 'Monaco Editor', role: 'IDE Experience', tag: 'Editor' },
    { name: 'Socket.IO', role: 'Live Sync & Cursors', tag: 'WebSockets' },
    { name: 'Vite', role: 'High-Speed Bundler', tag: 'Build' },
    { name: 'Node.js & Express', role: 'REST API & Security', tag: 'Backend' },
    { name: 'MongoDB', role: 'Mongoose Schemas', tag: 'Database' },
    { name: 'Sandboxed Engine', role: 'Isolated Execution', tag: 'Piston/Judge0' },
    { name: 'Google Gemini', role: 'AI Pair Programming', tag: 'AI Engine' },
  ];

  const testimonials = [
    {
      name: 'Alex Johnson',
      role: 'Staff Software Engineer',
      initials: 'AJ',
      quote:
        'CollabCode has completely transformed how our engineering team conducts technical pairing and system design reviews. Having real execution alongside the Monaco editor is a game-changer.',
      tag: 'Sample Testimonial',
    },
    {
      name: 'Priya Sharma',
      role: 'Computer Science Faculty & Mentor',
      initials: 'PS',
      quote:
        'For teaching data structures and algorithms, CollabCode provides the cleanest browser experience. Students can see each other’s code changes instantly without configuration friction.',
      tag: 'Sample Testimonial',
    },
    {
      name: 'Rohan Mehta',
      role: 'Full-Stack Lead',
      initials: 'RM',
      quote:
        'The multi-file support and integrated AI assistant make building full mini-projects in real time feel as natural as using desktop VS Code.',
      tag: 'Sample Testimonial',
    },
  ];

  const faqs = [
    {
      q: 'Which programming languages can I write and execute in CollabCode?',
      a: 'CollabCode natively supports real code execution for JavaScript, Python 3, C, C++, and Java. Standard input (stdin), compiler output, stderr, and execution duration are all fully captured in the terminal console.',
    },
    {
      q: 'How does real-time synchronization work between multiple collaborators?',
      a: 'We use high-performance WebSockets powered by Socket.IO. When you type or switch files, lightweight delta events and cursor updates are broadcast immediately to all room members, rendering live cursors with distinct collaborator colors.',
    },
    {
      q: 'Is code execution safe and isolated?',
      a: 'Yes. CollabCode delegates execution through isolated sandboxes with strict process timeouts (5-10s) and memory limits, never executing arbitrary untrusted code directly inside the main Express thread.',
    },
    {
      q: 'How does the AI Coding Assistant work?',
      a: 'The AI assistant understands your active file, programming language, selected code, and any compiler error messages. It can explain code line-by-line, diagnose bugs, suggest fixes, generate unit tests, or convert code between languages.',
    },
    {
      q: 'Can I track previous versions and revert changes?',
      a: 'Yes! The Version History panel lets you create manual snapshots or automatically records milestones. You can inspect colorized diffs comparing any previous snapshot and restore safely without losing newer work.',
    },
    {
      q: 'What role-based permissions are supported in workspaces?',
      a: 'Workspaces support Owner, Admin, Editor, and Viewer roles. Owners have full deletion and transfer privileges, Editors can modify code and run scripts, and Viewers have read-only access with live chat participation.',
    },
  ];

  return (
    <div className="landing-page-root">
      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <Sparkles size={14} className="sparkle-icon" />
          <span>Next-Gen Collaborative Cloud IDE</span>
        </div>

        <h1 className="hero-headline">
          Code Together. Build Together. <br />
          <span className="headline-gradient">In Real Time.</span>
        </h1>

        <p className="hero-subtext">
          CollabCode is a modern, developer-first collaborative coding platform featuring
          VS Code-style multi-file projects, WebSocket synchronization, isolated multi-language
          execution, and an integrated AI pair-programming assistant.
        </p>

        <div className="hero-cta-wrapper">
          <Link to="/signup" className="btn btn-primary btn-hero">
            Start Coding Free <ArrowRight size={18} />
          </Link>
          <Link to="/dashboard" className="btn btn-outline btn-hero">
            Explore Workspaces
          </Link>
        </div>

        {/* Quick Join Bar */}
        <form onSubmit={handleJoinSubmit} className="hero-join-bar">
          <span className="join-label">Have a room code?</span>
          <input
            type="text"
            className="input join-input"
            placeholder="e.g. PYTH01"
            maxLength={6}
            value={joinCodeInput}
            onChange={(e) => setJoinCodeInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">
            Join
          </button>
        </form>

        {/* 2. Interactive Animated Code Editor Mockup */}
        <div className="hero-editor-mockup">
          <div className="mockup-header">
            <div className="mockup-window-controls">
              <span className="window-dot dot-red"></span>
              <span className="window-dot dot-yellow"></span>
              <span className="window-dot dot-green"></span>
            </div>

            <div className="mockup-tabs">
              <div className="mockup-tab active">
                <span className="file-dot-js">JS</span>
                <span>algorithms.js</span>
              </div>
              <div className="mockup-tab">
                <span className="file-dot-py">PY</span>
                <span>main.py</span>
              </div>
              <div className="mockup-tab">
                <span className="file-dot-md">MD</span>
                <span>README.md</span>
              </div>
            </div>

            <div className="mockup-actions">
              <button
                type="button"
                className="mockup-run-btn"
                onClick={handleRunHero}
                disabled={isRunningHero}
              >
                <Play size={13} />
                <span>{isRunningHero ? 'Running...' : 'Run Code'}</span>
              </button>
            </div>
          </div>

          <div className="mockup-body">
            {/* Left simulated file tree */}
            <div className="mockup-sidebar">
              <span className="mockup-section-title">EXPLORER</span>
              <div className="mockup-file active">algorithms.js</div>
              <div className="mockup-file">main.py</div>
              <div className="mockup-file">utils.js</div>
              <div className="mockup-file">package.json</div>
              <div className="mockup-file">README.md</div>
            </div>

            {/* Center code display with simulated live collaborator cursors */}
            <div className="mockup-editor-content">
              <pre className="mockup-code">
                <code>{PREVIEW_CODE}</code>
              </pre>

              {/* Simulated Collaborator 1 */}
              <div className="simulated-cursor cursor-blue" style={{ top: '85px', left: '260px' }}>
                <span className="cursor-tag">Alex Johnson</span>
              </div>

              {/* Simulated Collaborator 2 */}
              <div className="simulated-cursor cursor-pink" style={{ top: '150px', left: '320px' }}>
                <span className="cursor-tag">Priya Sharma</span>
              </div>
            </div>
          </div>

          {/* Bottom output terminal */}
          <div className="mockup-terminal">
            <div className="terminal-header">
              <Terminal size={14} />
              <span>TERMINAL OUTPUT</span>
            </div>
            <pre className="terminal-text">{heroOutput}</pre>
          </div>
        </div>
      </section>

      {/* 3. Features Grid Section */}
      <section className="features-section">
        <div className="section-header-centered">
          <span className="section-pill">Feature Suite</span>
          <h2>Everything You Need for Elite Collaboration</h2>
          <p>Built from the ground up for pairs, teams, mentors, and technical interviews.</p>
        </div>

        <div className="features-grid">
          {features.map((feat, index) => (
            <div key={index} className="card feature-card-item">
              <div className="feat-icon-box">{feat.icon}</div>
              <h3>{feat.title}</h3>
              <p>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. How It Works / Collaboration Workflow */}
      <section className="workflow-section">
        <div className="section-header-centered">
          <span className="section-pill">Workflow</span>
          <h2>How CollabCode Powers Team Development</h2>
          <p>From initial scratchpad to production code in four streamlined steps.</p>
        </div>

        <div className="workflow-grid">
          {workflowSteps.map((s, idx) => (
            <div key={idx} className="workflow-card">
              <span className="step-number">{s.step}</span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. AI Assistant Feature Showcase */}
      <section className="ai-showcase-section">
        <div className="ai-showcase-container card">
          <div className="ai-showcase-left">
            <div className="ai-pill">
              <Bot size={16} />
              <span>Context-Aware AI Assistant</span>
            </div>
            <h2>Pair Program with an Expert AI Engineer</h2>
            <p>
              CollabCode integrates a context-aware AI assistant right in the workspace.
              It understands the entire active file, selected snippets, compiler error outputs,
              and target languages to give you immediate, actionable assistance.
            </p>

            <ul className="ai-feature-checklist">
              <li>
                <Check size={16} className="text-emerald" />
                <span>Explain complex algorithms line-by-line</span>
              </li>
              <li>
                <Check size={16} className="text-emerald" />
                <span>Detect edge-case bugs and logical vulnerabilities</span>
              </li>
              <li>
                <Check size={16} className="text-emerald" />
                <span>Generate unit tests covering tricky edge cases</span>
              </li>
              <li>
                <Check size={16} className="text-emerald" />
                <span>Convert code between JavaScript, Python, C++, and Java</span>
              </li>
            </ul>

            <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
              Try AI in Workspace →
            </Link>
          </div>

          <div className="ai-showcase-right">
            <div className="ai-chat-mockup">
              <div className="ai-msg user-msg">
                <span>Can you optimize this nested two-sum solution?</span>
              </div>
              <div className="ai-msg bot-msg">
                <span className="ai-bot-label">CollabCode AI</span>
                <p>
                  Certainly! The current nested solution is <code>O(n²)</code>. We can optimize it
                  to <code>O(n)</code> time using a single-pass hash map:
                </p>
                <pre className="ai-code-preview">
                  <code>{`def two_sum(nums, target):
    lookup = {}
    for i, num in enumerate(nums):
        comp = target - num
        if comp in lookup:
            return [lookup[comp], i]
        lookup[num] = i
    return []`}</code>
                </pre>
                <div className="ai-mock-actions">
                  <span className="action-pill">✓ Replace Selection</span>
                  <span className="action-pill">📋 Copy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Technology Stack Section */}
      <section className="techstack-section">
        <div className="section-header-centered">
          <span className="section-pill">Under the Hood</span>
          <h2>Production-Grade Technology Architecture</h2>
          <p>Engineered with modern, battle-tested full-stack web technologies.</p>
        </div>

        <div className="techstack-grid">
          {techStack.map((tech, i) => (
            <div key={i} className="techstack-card">
              <span className="tech-tag">{tech.tag}</span>
              <h4>{tech.name}</h4>
              <p>{tech.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-header-centered">
          <span className="section-pill">Community</span>
          <h2>Loved by Developers & Teams</h2>
          <p>Here’s what engineers and educators say about CollabCode.</p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <div key={i} className="card testimonial-card">
              <span className="sample-badge">{t.tag}</span>
              <p className="testimonial-quote">"{t.quote}"</p>
              <div className="testimonial-author">
                <div className="author-avatar">{t.initials}</div>
                <div>
                  <h4 className="author-name">{t.name}</h4>
                  <span className="author-role">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. FAQ Section */}
      <section className="faq-section">
        <div className="section-header-centered">
          <span className="section-pill">FAQ</span>
          <h2>Frequently Asked Questions</h2>
          <p>Everything you need to know about getting started with CollabCode.</p>
        </div>

        <div className="faq-container">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`faq-item card ${activeFaq === i ? 'open' : ''}`}
              onClick={() => toggleFaq(i)}
            >
              <div className="faq-question">
                <span>{faq.q}</span>
                <ChevronDown size={18} className="faq-chevron" />
              </div>
              {activeFaq === i && <div className="faq-answer">{faq.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* 9. Final Call to Action */}
      <section className="final-cta-section">
        <div className="final-cta-card card">
          <h2>Ready to Collaborate Without Friction?</h2>
          <p>Join thousands of developers coding together in real time on CollabCode.</p>
          <div className="final-cta-buttons">
            <Link to="/signup" className="btn btn-primary btn-hero">
              Get Started Now - It's Free
            </Link>
            <Link to="/login" className="btn btn-outline btn-hero">
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </section>

      {/* 10. Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-col-brand">
            <div className="footer-logo">
              <Code2 size={22} className="logo-svg" />
              <span>CollabCode</span>
            </div>
            <p className="footer-tagline">
              Code Together. Build Together. Learn Together. Production-oriented collaborative coding platform.
            </p>
            <span className="footer-copy">© {CURRENT_YEAR} CollabCode. All rights reserved.</span>
          </div>

          <div className="footer-links-group">
            <div className="footer-col">
              <h4>Platform</h4>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/analytics">Analytics</Link>
              <Link to="/signup">Start Free</Link>
            </div>

            <div className="footer-col">
              <h4>Supported</h4>
              <span>JavaScript (ES6+)</span>
              <span>Python 3.10+</span>
              <span>C++ / C</span>
              <span>Java 17+</span>
            </div>

            <div className="footer-col">
              <h4>Account</h4>
              <Link to="/login">Sign In</Link>
              <Link to="/signup">Register</Link>
              <Link to="/forgot-password">Reset Password</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
