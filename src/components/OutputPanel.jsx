// src/components/OutputPanel.jsx
import React, { useState } from 'react';
import {
  Terminal,
  Play,
  Square,
  Trash2,
  ChevronUp,
  ChevronDown,
  Clock,
  Keyboard,
  History,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import './OutputPanel.css';

export default function OutputPanel({
  output = '',
  stderr = '',
  isRunning = false,
  status = 'ready', // ready | running | success | error | compilation_error
  executionTimeMs = 0,
  stdin = '',
  onStdinChange,
  onRun,
  onStop,
  onClear,
  isCollapsed = false,
  onToggleCollapse,
  executionHistory = [],
}) {
  const [activeTab, setActiveTab] = useState('terminal'); // terminal | stdin | history

  const renderStatusBadge = () => {
    switch (status) {
      case 'running':
        return (
          <span className="exec-badge badge-running">
            <span className="pulse-dot"></span> Running...
          </span>
        );
      case 'success':
        return (
          <span className="exec-badge badge-success">
            <CheckCircle2 size={12} /> Success
          </span>
        );
      case 'error':
      case 'compilation_error':
        return (
          <span className="exec-badge badge-error">
            <AlertTriangle size={12} /> Failed
          </span>
        );
      default:
        return <span className="exec-badge badge-ready">● Ready</span>;
    }
  };

  return (
    <div className={`output-panel-container ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header Bar */}
      <div className="output-header-bar">
        <div className="output-header-left">
          {/* Tabs */}
          <div className="output-tab-group">
            <button
              type="button"
              className={`output-tab-btn ${activeTab === 'terminal' ? 'active' : ''}`}
              onClick={() => setActiveTab('terminal')}
            >
              <Terminal size={14} />
              <span>Terminal</span>
            </button>
            <button
              type="button"
              className={`output-tab-btn ${activeTab === 'stdin' ? 'active' : ''}`}
              onClick={() => setActiveTab('stdin')}
            >
              <Keyboard size={14} />
              <span>Input (stdin) {stdin.trim() ? '●' : ''}</span>
            </button>
            <button
              type="button"
              className={`output-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <History size={14} />
              <span>History ({executionHistory.length})</span>
            </button>
          </div>

          {/* Status Indicator */}
          {renderStatusBadge()}

          {/* Execution Time */}
          {executionTimeMs > 0 && (
            <span className="exec-time-label">
              <Clock size={12} />
              <span>{executionTimeMs}ms</span>
            </span>
          )}
        </div>

        <div className="output-header-right">
          {/* Stop Button */}
          {isRunning && (
            <button
              type="button"
              className="btn btn-outline btn-sm stop-btn"
              onClick={onStop}
              title="Stop execution"
            >
              <Square size={12} fill="currentColor" />
              <span>Stop</span>
            </button>
          )}

          {/* Clear Button */}
          <button
            type="button"
            className="action-icon-btn"
            onClick={onClear}
            title="Clear output console"
            aria-label="Clear output"
          >
            <Trash2 size={14} />
          </button>

          {/* Collapse / Expand Toggle */}
          <button
            type="button"
            className="action-icon-btn"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand Console' : 'Collapse Console'}
            aria-label="Toggle console height"
          >
            {isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Panel Body */}
      {!isCollapsed && (
        <div className="output-panel-body">
          {/* Tab 1: Terminal Output */}
          {activeTab === 'terminal' && (
            <div className="terminal-content">
              {isRunning && !output && !stderr ? (
                <div className="terminal-executing">
                  <span className="output-prompt-char">$</span>
                  <span>Compiling and executing program in isolated runner...</span>
                </div>
              ) : (
                <div className="terminal-text-wrapper font-mono">
                  {/* Standard Error / Compilation Errors */}
                  {stderr && (
                    <pre className="output-stderr">
                      <code>{stderr}</code>
                    </pre>
                  )}

                  {/* Standard Output */}
                  {output && (
                    <pre className="output-stdout">
                      <code>{output}</code>
                    </pre>
                  )}

                  {!output && !stderr && (
                    <span className="output-placeholder-text">
                      Click "▶ Run" to execute code. Standard output and errors will stream here.
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Standard Input (stdin) */}
          {activeTab === 'stdin' && (
            <div className="stdin-container">
              <span className="stdin-hint">
                Provide custom inputs line-by-line. They will be passed to your program's standard input (stdin) on execution.
              </span>
              <textarea
                className="input stdin-textarea font-mono"
                rows={4}
                placeholder="Enter inputs here (e.g. 10 25 or user inputs)..."
                value={stdin}
                onChange={(e) => onStdinChange && onStdinChange(e.target.value)}
              />
            </div>
          )}

          {/* Tab 3: Execution History */}
          {activeTab === 'history' && (
            <div className="history-container">
              {executionHistory.length === 0 ? (
                <div className="history-empty">No execution history recorded for this room yet.</div>
              ) : (
                <table className="history-table font-mono">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Language</th>
                      <th>Time</th>
                      <th>Duration</th>
                      <th>Output Preview</th>
                    </tr>
                  </thead>
                  <tbody>
                    {executionHistory.map((item) => (
                      <tr key={item._id || Math.random()}>
                        <td>
                          <span className={`exec-badge badge-${item.status}`}>
                            {item.status === 'success' ? '✓ Passed' : '✕ Failed'}
                          </span>
                        </td>
                        <td>{item.language?.toUpperCase()}</td>
                        <td>
                          {new Date(item.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td>{item.executionTimeMs}ms</td>
                        <td className="history-preview">
                          {item.stderr ? item.stderr.slice(0, 40) : (item.stdout?.slice(0, 40) || 'None')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
