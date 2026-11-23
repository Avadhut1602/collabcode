// src/components/ChatPanel.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Reply,
  Edit2,
  Trash2,
  Code2,
  Search,
  X,
  Copy,
  Check,
} from 'lucide-react';
import './ChatPanel.css';

export default function ChatPanel({
  messages = [],
  onSendMessage,
  onReaction,
  onEditMessage,
  onDeleteMessage,
  currentUserId,
  isOwner = false,
  typingUser = '',
  onTypingStart,
  onTypingStop,
}) {
  const [inputText, setInputText] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [replyTarget, setReplyTarget] = useState(null);
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editingText, setEditingText] = useState('');

  // Code snippet sharing dialog
  const [isSnippetModalOpen, setIsSnippetModalOpen] = useState(false);
  const [snippetCode, setSnippetCode] = useState('');
  const [snippetLang, setSnippetLang] = useState('javascript');
  const [snippetComment, setSnippetComment] = useState('');

  const [copiedCodeId, setCopiedCodeId] = useState(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUser]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (onTypingStart) {
      onTypingStart();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (onTypingStop) onTypingStop();
      }, 1500);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onSendMessage({
      text: inputText.trim(),
      replyTo: replyTarget?._id || null,
    });

    setInputText('');
    setReplyTarget(null);
    if (onTypingStop) onTypingStop();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSendSnippet = (e) => {
    e.preventDefault();
    if (!snippetCode.trim()) return;

    onSendMessage({
      text: snippetComment.trim() || 'Shared a code snippet:',
      codeSnippet: {
        code: snippetCode.trim(),
        language: snippetLang,
      },
    });

    setSnippetCode('');
    setSnippetComment('');
    setIsSnippetModalOpen(false);
  };

  const handleCopySnippet = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const filteredMessages = searchFilter.trim()
    ? messages.filter((m) =>
        m.text?.toLowerCase().includes(searchFilter.toLowerCase().trim()) ||
        m.codeSnippet?.code?.toLowerCase().includes(searchFilter.toLowerCase().trim())
      )
    : messages;

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="chat-panel-container">
      {/* Header */}
      <div className="chat-panel-header">
        <div className="chat-header-title">
          <MessageSquare size={16} />
          <span>TEAM CHAT</span>
        </div>
        <span className="chat-badge">{messages.length}</span>
      </div>

      {/* Search Bar */}
      <div className="chat-search-bar">
        <Search size={13} className="chat-search-icon" />
        <input
          type="text"
          className="chat-search-input"
          placeholder="Filter messages..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
        />
        {searchFilter && (
          <button
            type="button"
            className="chat-search-clear"
            onClick={() => setSearchFilter('')}
          >
            ×
          </button>
        )}
      </div>

      {/* Messages Stream */}
      <ul className="chat-messages-stream">
        {filteredMessages.length === 0 ? (
          <li className="chat-empty-hint">
            {searchFilter ? 'No messages match search.' : 'No messages yet. Say hello to teammates!'}
          </li>
        ) : (
          filteredMessages.map((msg) => {
            const senderId = (msg.sender?._id || msg.sender?.id || msg.sender || msg.userId)?.toString();
            const isOwn = senderId === currentUserId?.toString();
            const senderName = msg.sender?.name || msg.userName || 'Teammate';
            const isEditing = editingMsgId === msg._id;

            return (
              <li key={msg._id || msg.id} className={`chat-message-row ${isOwn ? 'own-msg' : 'other-msg'}`}>
                {/* Replying quote if present */}
                {msg.replyTo && (
                  <div className="reply-quote-box">
                    <span className="quote-sender">
                      Replying to {msg.replyTo.sender?.name || 'Teammate'}:
                    </span>
                    <p className="quote-snippet">
                      {msg.replyTo.text?.slice(0, 50)}...
                    </p>
                  </div>
                )}

                <div className="message-header-row">
                  <span className="message-author">{senderName}</span>
                  <span className="message-timestamp">
                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {msg.isEdited && <span className="edited-indicator">(edited)</span>}
                </div>

                {/* Message Body */}
                <div className="message-bubble-content">
                  {isEditing ? (
                    <div className="editing-box">
                      <input
                        type="text"
                        className="input editing-input"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        autoFocus
                      />
                      <div className="editing-actions">
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => setEditingMsgId(null)}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            onEditMessage && onEditMessage(msg._id, editingText);
                            setEditingMsgId(null);
                          }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="message-text">{msg.text}</div>
                  )}

                  {/* Shared Code Snippet */}
                  {msg.codeSnippet?.code && (
                    <div className="shared-snippet-card">
                      <div className="snippet-meta">
                        <span>{msg.codeSnippet.language?.toUpperCase() || 'CODE'}</span>
                        <button
                          type="button"
                          className="copy-snippet-btn"
                          onClick={() => handleCopySnippet(msg.codeSnippet.code, msg._id)}
                        >
                          {copiedCodeId === msg._id ? <Check size={12} /> : <Copy size={12} />}
                          <span>{copiedCodeId === msg._id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <pre className="snippet-body font-mono">
                        <code>{msg.codeSnippet.code}</code>
                      </pre>
                    </div>
                  )}
                </div>

                {/* Message Actions */}
                <div className="message-footer-row">
                  {/* Reply / Edit / Delete Options */}
                  <div className="message-hover-actions">
                    <button
                      type="button"
                      className="msg-action-btn"
                      onClick={() => setReplyTarget(msg)}
                      title="Reply"
                    >
                      <Reply size={12} />
                    </button>

                    {isOwn && (
                      <button
                        type="button"
                        className="msg-action-btn"
                        onClick={() => {
                          setEditingMsgId(msg._id);
                          setEditingText(msg.text);
                        }}
                        title="Edit"
                      >
                        <Edit2 size={12} />
                      </button>
                    )}

                    {(isOwn || isOwner) && (
                      <button
                        type="button"
                        className="msg-action-btn delete-btn"
                        onClick={() => {
                          if (window.confirm('Delete this message?')) {
                            onDeleteMessage && onDeleteMessage(msg._id);
                          }
                        }}
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })
        )}

        {/* Typing Indicator */}
        {typingUser && (
          <li className="typing-status-row">
            <span className="typing-text">{typingUser} is typing...</span>
          </li>
        )}

        <div ref={messagesEndRef} />
      </ul>

      {/* Reply Banner */}
      {replyTarget && (
        <div className="active-reply-banner">
          <div className="reply-info">
            <Reply size={13} />
            <span>
              Replying to <strong>{replyTarget.sender?.name || 'Teammate'}</strong>
            </span>
          </div>
          <button
            type="button"
            className="cancel-reply-btn"
            onClick={() => setReplyTarget(null)}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Input Bar */}
      <form onSubmit={handleSubmit} className="chat-input-bar">
        <button
          type="button"
          className="snippet-dialog-btn"
          onClick={() => setIsSnippetModalOpen(true)}
          title="Share code snippet"
          aria-label="Share code snippet"
        >
          <Code2 size={16} />
        </button>

        <input
          type="text"
          className="input chat-input-field"
          placeholder="Message teammates... (Enter to send)"
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />

        <button
          type="submit"
          className="btn btn-primary chat-send-btn"
          disabled={!inputText.trim()}
          aria-label="Send message"
        >
          <Send size={15} />
        </button>
      </form>

      {/* Share Code Snippet Modal */}
      {isSnippetModalOpen && (
        <div className="modal-overlay" onClick={() => setIsSnippetModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Share Code Snippet in Chat</h2>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsSnippetModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendSnippet}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div className="form-group">
                  <label htmlFor="snip-lang" className="form-label">Language</label>
                  <select
                    id="snip-lang"
                    className="input"
                    value={snippetLang}
                    onChange={(e) => setSnippetLang(e.target.value)}
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="cpp">C++</option>
                    <option value="java">Java</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="json">JSON</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="snip-code" className="form-label">Code Snippet *</label>
                  <textarea
                    id="snip-code"
                    className="input font-mono"
                    rows={6}
                    placeholder="Paste code snippet here..."
                    value={snippetCode}
                    onChange={(e) => setSnippetCode(e.target.value)}
                    autoFocus
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="snip-desc" className="form-label">Accompanying Note (Optional)</label>
                  <input
                    id="snip-desc"
                    type="text"
                    className="input"
                    placeholder="e.g. Check out this helper function"
                    value={snippetComment}
                    onChange={(e) => setSnippetComment(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsSnippetModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={!snippetCode.trim()}>
                  Post to Chat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
