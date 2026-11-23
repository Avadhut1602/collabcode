// src/components/VersionHistory.jsx
import React, { useState, useEffect } from 'react';
import {
  History,
  RotateCcw,
  GitCommit,
  Plus,
  Clock,
  User,
  Eye,
  X,
  FileCode,
} from 'lucide-react';
import api from '../api/api';
import './VersionHistory.css';

// Simple Myers-like line diff generator
const generateLineDiff = (oldText = '', newText = '') => {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const diffResult = [];

  const maxLines = Math.max(oldLines.length, newLines.length);
  for (let i = 0; i < maxLines; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];

    if (oldLine === newLine) {
      if (oldLine !== undefined) {
        diffResult.push({ type: 'same', text: oldLine, oldNum: i + 1, newNum: i + 1 });
      }
    } else {
      if (oldLine !== undefined) {
        diffResult.push({ type: 'del', text: oldLine, oldNum: i + 1, newNum: '' });
      }
      if (newLine !== undefined) {
        diffResult.push({ type: 'add', text: newLine, oldNum: '', newNum: i + 1 });
      }
    }
  }

  return diffResult;
};

export default function VersionHistory({
  roomId,
  currentFiles = [],
  onRestoreVersion,
  canEdit = true,
}) {
  const [versions, setVersions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);
  const [snapshotDesc, setSnapshotDesc] = useState('');

  // Diff inspection modal
  const [diffModalVersion, setDiffModalVersion] = useState(null);
  const [selectedDiffFile, setSelectedDiffFile] = useState(null);

  const fetchVersions = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/rooms/${roomId}/versions`);
      setVersions(res.data || []);
    } catch (err) {
      console.error('Failed to load version history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) {
      fetchVersions();
    }
  }, [roomId]);

  const handleCreateSnapshot = async (e) => {
    e.preventDefault();
    try {
      setIsCreatingSnapshot(true);
      const res = await api.post(`/rooms/${roomId}/versions`, {
        description: snapshotDesc.trim() || undefined,
      });
      setVersions((prev) => [res.data, ...prev]);
      setSnapshotDesc('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save snapshot');
    } finally {
      setIsCreatingSnapshot(false);
    }
  };

  const handleRestore = async (version) => {
    if (
      !window.confirm(
        `Restore workspace to v${version.versionNumber} ("${version.description}")? A backup snapshot of your current state will be created automatically.`
      )
    ) {
      return;
    }

    try {
      const res = await api.post(`/rooms/${roomId}/versions/${version._id}/restore`);
      if (onRestoreVersion) {
        onRestoreVersion(res.data.room);
      }
      fetchVersions();
      setDiffModalVersion(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to restore snapshot');
    }
  };

  const handleOpenDiff = (version) => {
    setDiffModalVersion(version);
    const firstFile = version.filesSnapshot?.[0];
    setSelectedDiffFile(firstFile || null);
  };

  return (
    <div className="version-history-panel">
      {/* Header */}
      <div className="version-header">
        <span className="version-title">VERSION TIMELINE</span>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={fetchVersions}
          title="Refresh History"
        >
          <History size={13} />
        </button>
      </div>

      {/* Snapshot Creator */}
      {canEdit && (
        <form onSubmit={handleCreateSnapshot} className="snapshot-form">
          <input
            type="text"
            className="input snapshot-input"
            placeholder="Snapshot note (e.g. Added BFS)..."
            value={snapshotDesc}
            onChange={(e) => setSnapshotDesc(e.target.value)}
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm save-snapshot-btn"
            disabled={isCreatingSnapshot}
          >
            <Plus size={14} />
            <span>Save</span>
          </button>
        </form>
      )}

      {/* Timeline List */}
      <div className="version-timeline-list">
        {isLoading ? (
          <div className="version-empty-hint">Loading versions...</div>
        ) : versions.length === 0 ? (
          <div className="version-empty-hint">No snapshots recorded yet.</div>
        ) : (
          versions.map((ver) => (
            <div key={ver._id} className="version-item card">
              <div className="version-top-row">
                <span className="version-tag">
                  <GitCommit size={13} /> v{ver.versionNumber}
                </span>
                <span className="version-time">
                  {new Date(ver.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              <p className="version-desc">{ver.description || 'Automatic snapshot'}</p>

              <div className="version-author">
                <User size={12} />
                <span>{ver.author?.name || 'Teammate'}</span>
              </div>

              <div className="version-actions-row">
                <button
                  type="button"
                  className="btn btn-outline btn-sm diff-btn"
                  onClick={() => handleOpenDiff(ver)}
                >
                  <Eye size={12} /> Inspect Diff
                </button>

                {canEdit && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm restore-btn"
                    onClick={() => handleRestore(ver)}
                    title="Roll back to this version"
                  >
                    <RotateCcw size={12} /> Restore
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Diff Inspection Modal */}
      {diffModalVersion && (
        <div className="modal-overlay" onClick={() => setDiffModalVersion(null)}>
          <div
            className="modal-content diff-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <GitCommit size={18} color="var(--primary-accent)" />
                <h2>
                  Compare: Current vs v{diffModalVersion.versionNumber} (
                  {diffModalVersion.description})
                </h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setDiffModalVersion(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="diff-modal-body">
              {/* File selector in snapshot */}
              <div className="diff-file-selector">
                <span className="diff-file-label">Files in snapshot:</span>
                <div className="diff-file-pills">
                  {diffModalVersion.filesSnapshot?.map((f) => (
                    <button
                      key={f.path || f.name}
                      type="button"
                      className={`diff-file-pill ${selectedDiffFile?.path === f.path ? 'active' : ''}`}
                      onClick={() => setSelectedDiffFile(f)}
                    >
                      <FileCode size={13} />
                      <span>{f.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Colorized Line Diff Viewer */}
              <div className="diff-viewer-container">
                {selectedDiffFile ? (
                  (() => {
                    const currentMatchingFile = currentFiles.find(
                      (cf) => cf.path === selectedDiffFile.path || cf.name === selectedDiffFile.name
                    );
                    const diffLines = generateLineDiff(
                      selectedDiffFile.content || '',
                      currentMatchingFile?.content || ''
                    );

                    return (
                      <table className="diff-table">
                        <tbody>
                          {diffLines.map((line, idx) => (
                            <tr key={idx} className={`diff-line diff-${line.type}`}>
                              <td className="diff-num">{line.oldNum}</td>
                              <td className="diff-num">{line.newNum}</td>
                              <td className="diff-marker">
                                {line.type === 'add' ? '+' : line.type === 'del' ? '-' : ' '}
                              </td>
                              <td className="diff-text">
                                <code>{line.text}</code>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    );
                  })()
                ) : (
                  <div className="diff-empty">Select a file to inspect differences.</div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setDiffModalVersion(null)}
              >
                Close
              </button>
              {canEdit && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleRestore(diffModalVersion)}
                >
                  <RotateCcw size={14} /> Restore this Version
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
