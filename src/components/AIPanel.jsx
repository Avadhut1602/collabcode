// src/components/AIPanel.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Bug,
  Zap,
  FileText,
  Copy,
  Check,
  ArrowRight,
  RefreshCw,
  Code2,
  FileCode,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import api from '../api/api';
import './AIPanel.css';

const QUICK_ACTIONS = [
  { id: 'explain_selection', label: 'Explain Code', icon: <FileText size={13} /> },
  { id: 'explain_file', label: 'Explain File', icon: <FileCode size={13} /> },
  { id: 'detect_bugs', label: 'Find Bugs', icon: <Bug size={13} /> },
  { id: 'suggest_fixes', label: 'Fix Issues', icon: <Zap size={13} /> },
  { id: 'optimize', label: 'Optimize', icon: <Sparkles size={13} /> },
  { id: 'generate_comments', label: 'Add Comments', icon: <Code2 size={13} /> },
  { id: 'generate_tests', label: 'Unit Tests', icon: <ShieldCheck size={13} /> },
  { id: 'best_practices', label: 'Best Practices', icon: <HelpCircle size={13} /> },
];

export default function AIPanel({
  activeFile,
  activeCode = '',
  selectedCode = '',
  language = 'javascript',
  errorContext = '',
  onInsertCode,
  onReplaceCode,
}) {
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'ai',
      text: "Hello! I am your CollabCode AI Pair Programmer. I understand your active file, selected code snippet, and execution errors. How can I help you build or debug today?",
      codeSnippet: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedSnippetId, setCopiedSnippetId] = useState(null);
  const [configStatus, setConfigStatus] = useState(null); // null | { configured: false, help: ... }

  // Target conversion language
  const [targetLang, setTargetLang] = useState('python');

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  const handleSendPrompt = async (action = 'chat', customPrompt = '') => {
    const promptToSend = customPrompt || inputPrompt;
    if (!promptToSend.trim() && action === 'chat') return;

    const userMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: promptToSend || `Triggered action: ${action.replace('_', ' ')}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!customPrompt) setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await api.post('/ai/query', {
        prompt: promptToSend,
        action,
        code: activeCode,
        selectedCode,
        language,
        fileName: activeFile?.name || 'main',
        errorContext,
        targetLanguage: action === 'convert_language' ? targetLang : '',
      });

      if (res.data.configured === false) {
        setConfigStatus(res.data);
        const aiNotice = {
          id: String(Date.now() + 1),
          sender: 'ai',
          text: res.data.message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiNotice]);
      } else {
        setConfigStatus(null);
        // Parse code blocks from markdown
        const replyText = res.data.reply || '';
        const codeBlockMatch = replyText.match(/```[a-zA-Z]*\n([\s\S]*?)```/);
        const extractedCode = codeBlockMatch ? codeBlockMatch[1] : '';

        const aiMessage = {
          id: String(Date.now() + 1),
          sender: 'ai',
          text: replyText,
          codeSnippet: extractedCode,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.message || 'AI request failed. Please check your network and API keys.';
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          sender: 'ai',
          text: `⚠️ ${errMsg}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt('chat');
    }
  };

  return (
    <div className="ai-panel-container">
      {/* Header */}
      <div className="ai-panel-header">
        <div className="ai-header-title">
          <Bot size={16} color="var(--accent-purple)" />
          <span>AI ASSISTANT</span>
        </div>
        <span className="ai-context-indicator" title={`Active context: ${activeFile?.name || 'Workspace'}`}>
          {activeFile?.name || 'No file selected'} ({language})
        </span>
      </div>

      {/* Suggested Quick Action Pills */}
      <div className="ai-quick-actions-bar">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            className="quick-action-pill"
            onClick={() => handleSendPrompt(action.id)}
            disabled={isLoading}
          >
            {action.icon}
            <span>{action.label}</span>
          </button>
        ))}
      </div>

      {/* Language Converter Row */}
      <div className="ai-convert-bar">
        <span className="convert-label">Convert to:</span>
        <select
          className="convert-select"
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
        >
          <option value="python">Python</option>
          <option value="javascript">JavaScript</option>
          <option value="cpp">C++</option>
          <option value="java">Java</option>
          <option value="c">C</option>
        </select>
        <button
          type="button"
          className="convert-btn"
          onClick={() => handleSendPrompt('convert_language')}
          disabled={isLoading}
        >
          Convert Code
        </button>
      </div>

      {/* If error in execution output, offer 1-click diagnostic */}
      {errorContext && (
        <div className="error-diagnose-banner">
          <AlertCircle size={14} color="var(--accent-rose)" />
          <span>Execution error detected.</span>
          <button
            type="button"
            className="diagnose-btn"
            onClick={() => handleSendPrompt('explain_error', 'Analyze and resolve this execution error')}
            disabled={isLoading}
          >
            Explain Error
          </button>
        </div>
      )}

      {/* API Configuration Guide Notice if key missing */}
      {configStatus?.configured === false && (
        <div className="card ai-config-card">
          <div className="config-card-header">
            <Sparkles size={16} color="var(--accent-purple)" />
            <h4>AI API Key Setup Required</h4>
          </div>
          <p className="config-card-text">
            To enable live AI completions, add your free Google Gemini API key or OpenAI API key to <code>server/.env</code>:
          </p>
          <pre className="config-env-snippet">
            <code>GEMINI_API_KEY=your_gemini_api_key_here</code>
          </pre>
          <span className="config-hint">
            Get a key free from Google AI Studio (aistudio.google.com). Once added, restart the server.
          </span>
        </div>
      )}

      {/* Chat Messages Stream */}
      <div className="ai-messages-stream">
        {messages.map((msg) => (
          <div key={msg.id} className={`ai-message-row ${msg.sender === 'user' ? 'user-row' : 'bot-row'}`}>
            <div className="message-header">
              <span className="message-sender-tag">
                {msg.sender === 'user' ? 'You' : 'CollabCode AI'}
              </span>
              <span className="message-timestamp">{msg.timestamp}</span>
            </div>

            <div className="message-bubble-body">
              <div className="ai-markdown-text">{msg.text}</div>

              {/* Code Snippet Action Card */}
              {msg.codeSnippet && (
                <div className="ai-code-card">
                  <div className="ai-code-header">
                    <span>Generated Code</span>
                    <div className="ai-code-btn-group">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm snippet-btn"
                        onClick={() => handleCopyCode(msg.codeSnippet, msg.id)}
                        title="Copy to clipboard"
                      >
                        {copiedSnippetId === msg.id ? <Check size={12} /> : <Copy size={12} />}
                        <span>{copiedSnippetId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>

                      {onInsertCode && (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm snippet-btn"
                          onClick={() => onInsertCode(msg.codeSnippet)}
                          title="Insert into editor at cursor"
                        >
                          ⬇ Insert
                        </button>
                      )}

                      {onReplaceCode && selectedCode && (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm snippet-btn"
                          onClick={() => onReplaceCode(msg.codeSnippet)}
                          title="Replace selected code"
                        >
                          🔄 Replace
                        </button>
                      )}
                    </div>
                  </div>
                  <pre className="ai-code-content font-mono">
                    <code>{msg.codeSnippet}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="ai-message-row bot-row">
            <div className="message-header">
              <span className="message-sender-tag">CollabCode AI</span>
            </div>
            <div className="ai-typing-indicator">
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span className="typing-dot"></span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                Analyzing code context...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendPrompt('chat');
        }}
        className="ai-input-form"
      >
        <textarea
          className="input ai-textarea"
          placeholder="Ask AI anything (e.g. Optimize this function, find edge cases)..."
          rows={2}
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="submit"
          className="btn btn-primary ai-submit-btn"
          disabled={!inputPrompt.trim() || isLoading}
          aria-label="Send query"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
