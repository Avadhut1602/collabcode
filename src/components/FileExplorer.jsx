// src/components/FileExplorer.jsx
import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  Plus,
  FolderPlus,
  Trash2,
  Edit2,
  ChevronRight,
  ChevronDown,
  Search,
  File,
} from 'lucide-react';
import './FileExplorer.css';

// Extension to color & icon mapper
const getFileIcon = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
      return <span className="ext-icon ext-js">JS</span>;
    case 'ts':
    case 'tsx':
      return <span className="ext-icon ext-ts">TS</span>;
    case 'py':
      return <span className="ext-icon ext-py">PY</span>;
    case 'cpp':
    case 'cc':
      return <span className="ext-icon ext-cpp">C++</span>;
    case 'c':
      return <span className="ext-icon ext-c">C</span>;
    case 'java':
      return <span className="ext-icon ext-java">JV</span>;
    case 'html':
      return <span className="ext-icon ext-html">&lt;&gt;</span>;
    case 'css':
      return <span className="ext-icon ext-css">#</span>;
    case 'json':
      return <span className="ext-icon ext-json">{}</span>;
    case 'md':
      return <span className="ext-icon ext-md">M↓</span>;
    default:
      return <FileText size={15} className="ext-icon ext-default" />;
  }
};

export default function FileExplorer({
  files = [],
  activeFileId,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
  canEdit = true,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedFolders, setCollapsedFolders] = useState({});
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newEntryName, setNewEntryName] = useState('');
  const [renamingFileId, setRenamingFileId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const toggleFolder = (folderPath) => {
    setCollapsedFolders((prev) => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }));
  };

  const handleStartCreate = (isFolder) => {
    setIsCreatingFolder(isFolder);
    setIsCreatingFile(!isFolder);
    setNewEntryName('');
  };

  const handleConfirmCreate = (e) => {
    e.preventDefault();
    if (!newEntryName.trim()) {
      setIsCreatingFile(false);
      setIsCreatingFolder(false);
      return;
    }

    const ext = newEntryName.split('.').pop().toLowerCase();
    let lang = 'javascript';
    if (ext === 'py') lang = 'python';
    if (ext === 'cpp' || ext === 'c') lang = 'cpp';
    if (ext === 'java') lang = 'java';
    if (ext === 'html') lang = 'html';
    if (ext === 'css') lang = 'css';
    if (ext === 'json') lang = 'json';
    if (ext === 'md') lang = 'markdown';

    onCreateFile({
      name: newEntryName.trim(),
      isFolder: isCreatingFolder,
      parentPath: '/',
      content: isCreatingFolder ? '' : `// ${newEntryName.trim()}\n`,
      language: lang,
    });

    setNewEntryName('');
    setIsCreatingFile(false);
    setIsCreatingFolder(false);
  };

  const handleStartRename = (file, e) => {
    e.stopPropagation();
    setRenamingFileId(file._id || file.id);
    setRenameValue(file.name);
  };

  const handleConfirmRename = (fileId, e) => {
    e.preventDefault();
    if (renameValue.trim()) {
      onRenameFile(fileId, renameValue.trim());
    }
    setRenamingFileId(null);
  };

  // Filter files by search
  const displayedFiles = searchQuery.trim()
    ? files.filter((f) => f.name.toLowerCase().includes(searchQuery.toLowerCase().trim()))
    : files;

  return (
    <div className="file-explorer-container">
      {/* Header Actions */}
      <div className="explorer-header">
        <span className="explorer-title">FILES</span>

        {canEdit && (
          <div className="explorer-actions">
            <button
              type="button"
              className="action-icon-btn"
              onClick={() => handleStartCreate(false)}
              title="New File"
              aria-label="New File"
            >
              <Plus size={15} />
            </button>
            <button
              type="button"
              className="action-icon-btn"
              onClick={() => handleStartCreate(true)}
              title="New Folder"
              aria-label="New Folder"
            >
              <FolderPlus size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Quick Search */}
      <div className="explorer-search">
        <Search size={13} className="search-icon-sm" />
        <input
          type="text"
          className="search-input-sm"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Inline Create Input */}
      {(isCreatingFile || isCreatingFolder) && (
        <form onSubmit={handleConfirmCreate} className="inline-create-form">
          {isCreatingFolder ? (
            <Folder size={15} color="#eab308" />
          ) : (
            <FileCode size={15} color="#38bdf8" />
          )}
          <input
            type="text"
            className="inline-input"
            placeholder={isCreatingFolder ? 'folder-name' : 'filename.ext'}
            value={newEntryName}
            onChange={(e) => setNewEntryName(e.target.value)}
            onBlur={() => {
              if (!newEntryName.trim()) {
                setIsCreatingFile(false);
                setIsCreatingFolder(false);
              }
            }}
            autoFocus
          />
        </form>
      )}

      {/* File Tree List */}
      <ul className="file-tree-list">
        {displayedFiles.length === 0 && !isCreatingFile && !isCreatingFolder ? (
          <li className="file-empty-hint">No files in project</li>
        ) : (
          displayedFiles.map((file) => {
            const fileId = file._id || file.id;
            const isActive = activeFileId === fileId?.toString();
            const isRenaming = renamingFileId === fileId;

            if (file.isFolder) {
              const isCollapsed = collapsedFolders[file.path];
              return (
                <li
                  key={fileId}
                  className="folder-tree-item"
                  onClick={() => toggleFolder(file.path)}
                >
                  <div className="item-label-row">
                    <span className="folder-caret">
                      {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                    </span>
                    {isCollapsed ? (
                      <Folder size={15} className="folder-icon" />
                    ) : (
                      <FolderOpen size={15} className="folder-icon" />
                    )}
                    {isRenaming ? (
                      <form onSubmit={(e) => handleConfirmRename(fileId, e)} className="rename-form">
                        <input
                          type="text"
                          className="rename-input"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onBlur={(e) => handleConfirmRename(fileId, e)}
                          autoFocus
                        />
                      </form>
                    ) : (
                      <span className="folder-name">{file.name}</span>
                    )}
                  </div>

                  {canEdit && (
                    <div className="file-item-actions">
                      <button
                        type="button"
                        className="file-action-btn"
                        onClick={(e) => handleStartRename(file, e)}
                        title="Rename Folder"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        type="button"
                        className="file-action-btn delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete folder "${file.name}" and its contents?`)) {
                            onDeleteFile(fileId);
                          }
                        }}
                        title="Delete Folder"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </li>
              );
            }

            return (
              <li
                key={fileId}
                className={`file-tree-item ${isActive ? 'active' : ''}`}
                onClick={() => onSelectFile(file)}
              >
                <div className="item-label-row">
                  {getFileIcon(file.name)}
                  {isRenaming ? (
                    <form onSubmit={(e) => handleConfirmRename(fileId, e)} className="rename-form">
                      <input
                        type="text"
                        className="rename-input"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={(e) => handleConfirmRename(fileId, e)}
                        autoFocus
                      />
                    </form>
                  ) : (
                    <span className="file-name">{file.name}</span>
                  )}
                </div>

                {canEdit && (
                  <div className="file-item-actions">
                    <button
                      type="button"
                      className="file-action-btn"
                      onClick={(e) => handleStartRename(file, e)}
                      title="Rename"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      type="button"
                      className="file-action-btn delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(`Delete file "${file.name}"?`)) {
                          onDeleteFile(fileId);
                        }
                      }}
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
