// src/components/SnippetCard.tsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../app/store';
import {
  selectAllFolders,
  toggleSnippetInFolder,
  updateFolderAsync,
} from '../features/folders/folderSlice';
import {
  deleteSnippetAsync,
  updateSnippetAsync,
} from '../features/snippets/snippetSlice';
import type { Folder } from '../features/folders/folderSlice';

type Snippet = {
  _id: string;
  title: string;
  description: string;
  language: string;
  code: string;
};

const SnippetCard: React.FC<{ snippet: Snippet }> = ({ snippet }) => {
  const dispatch = useDispatch<AppDispatch>();
  const folders = useSelector((s: RootState) => selectAllFolders(s));

  // Folder‐modal state
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('');

  // Edit‐mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(snippet.title);
  const [editDesc, setEditDesc] = useState(snippet.description);
  const [editLang, setEditLang] = useState(snippet.language);
  const [editCode, setEditCode] = useState(snippet.code);

  // AI analysis state
  const [analysis, setAnalysis] = useState<
    | { rating: number; alternatives: { rank: number; code: string }[] }
    | null
  >(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  /** ───── Folder Handlers ───── */
  const openFolderModal  = () => setIsFolderModalOpen(true);
  const closeFolderModal = () => {
    setIsFolderModalOpen(false);
    setSelectedFolder('');
  };
  const confirmAddToFolder = () => {
    if (!selectedFolder) return;
    dispatch(
      toggleSnippetInFolder({ folderId: selectedFolder, snippetId: snippet._id })
    );
    const folder = folders.find(f => (f._id||f.id) === selectedFolder) as Folder;
    if (folder?._id) {
      const newIds = folder.snippetIds.includes(snippet._id)
        ? folder.snippetIds.filter(id => id !== snippet._id)
        : [...folder.snippetIds, snippet._id];
      dispatch(updateFolderAsync({ _id: folder._id, snippetIds: newIds }));
    }
    closeFolderModal();
  };

  /** ───── Delete Handler ───── */
  const handleDelete = () => {
    if (window.confirm(`Delete snippet “${snippet.title}”?`)) {
      dispatch(deleteSnippetAsync(snippet._id));
    }
  };

  /** ───── Edit Handlers ───── */
  const beginEdit = () => setIsEditing(true);
  const cancelEdit = () => {
    setIsEditing(false);
    setEditTitle(snippet.title);
    setEditDesc(snippet.description);
    setEditLang(snippet.language);
    setEditCode(snippet.code);
  };
  const saveEdit = () => {
    dispatch(
      updateSnippetAsync({
        _id: snippet._id,
        title: editTitle,
        description: editDesc,
        language: editLang,
        code: editCode,
      })
    );
    setIsEditing(false);
  };

  /** ───── AI Handlers ───── */
  const fetchAlternatives = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/alternatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: snippet.code, language: snippet.language }),
      });
      if (res.ok) {
        setAnalysis(await res.json());
      }
    } catch (err) {
      console.error('AI analysis failed', err);
    } finally {
      setIsAnalyzing(false);
    }
  };
  const closeAnalysis = () => setAnalysis(null);

  /** ───── Render ───── */
  if (isEditing) {
    return (
      <article className="mb-6 border border-wood-dark rounded-lg p-4 bg-wood-dark/60">
        <h3 className="text-yellow-100 font-semibold mb-2 pirate-font">Editing Snippet</h3>
        <input
          className="w-full mb-2 p-1 rounded"
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
        />
        <input
          className="w-full mb-2 p-1 rounded italic text-gray-200 bg-gray-800"
          value={editDesc}
          onChange={e => setEditDesc(e.target.value)}
        />
        <input
          className="w-full mb-2 p-1 rounded text-sm bg-gray-800 text-white"
          value={editLang}
          onChange={e => setEditLang(e.target.value)}
        />
        <textarea
          className="w-full mb-4 p-1 rounded font-mono text-sm bg-gray-800 text-white"
          rows={6}
          value={editCode}
          onChange={e => setEditCode(e.target.value)}
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={cancelEdit}
            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={saveEdit}
            className="px-3 py-1 bg-wood text-yellow-300 rounded hover:bg-wood-dark"
          >
            Save
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="relative mb-6 border border-wood-dark rounded-lg p-4 bg-wood-dark/60">
      {/* Header: title + buttons */}
      <header className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-yellow-200 text-lg font-semibold pirate-font">{snippet.title}</h3>
          <p className="text-gray-200 text-sm italic">{snippet.description}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={beginEdit}
            aria-label="Edit snippet"
            className="text-white hover:text-yellow-300 focus:outline-none"
          >
            ✎
          </button>
          <button
            onClick={handleDelete}
            aria-label="Delete snippet"
            className="text-white hover:text-red-500 focus:outline-none"
          >
            🗑
          </button>
          <button
            onClick={fetchAlternatives}
            aria-label="AI alternatives"
            className="text-white hover:text-purple-300 focus:outline-none"
          >
            ✨
          </button>
          <button
            onClick={openFolderModal}
            aria-label="Add to folder"
            className="text-white text-2xl hover:text-green-300 focus:outline-none"
          >
            ＋
          </button>
        </div>
      </header>

      {/* Language badge */}
      <span className="inline-block bg-wood text-yellow-200 text-xs px-2 py-1 rounded-full mb-2">
        {snippet.language}
      </span>

      {/* Code */}
      <pre className="mt-2 text-white font-mono text-sm whitespace-pre-wrap pl-2">
        {snippet.code}
      </pre>

      {/* Folder modal */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <h4 className="mb-4 text-gray-800 font-medium">
              Add &quot;{snippet.title}&quot; to folder
            </h4>
            <select
              className="w-full p-2 border border-gray-300 rounded mb-6"
              value={selectedFolder}
              onChange={e => setSelectedFolder(e.target.value)}
            >
              <option value="">Select folder…</option>
              {folders.map(f => (
                <option key={f._id || f.id} value={f._id || f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeFolderModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmAddToFolder}
                className="px-4 py-2 bg-wood text-yellow-300 rounded hover:bg-wood-dark"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI analysis modal */}
      {analysis && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-[90%] max-w-2xl overflow-y-auto">
            <h4 className="mb-4 text-gray-800 font-medium">AI Alternatives</h4>
            <p className="mb-4 text-sm text-gray-700">Original efficiency rating: {analysis.rating}/10</p>
            <div className="space-y-4">
              {analysis.alternatives.map(alt => (
                <pre
                  key={alt.rank}
                  className="bg-gray-800 text-white text-sm rounded p-2 whitespace-pre-wrap"
                >
                  {`#${alt.rank}: ${alt.code}`}
                </pre>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={closeAnalysis} className="px-4 py-2 bg-wood text-yellow-300 rounded hover:bg-wood-dark">Close</button>
            </div>
          </div>
        </div>
      )}

      {isAnalyzing && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-25 z-40">
          <div className="bg-white rounded-lg p-4">Analyzing…</div>
        </div>
      )}
    </article>
  );
};

export default SnippetCard;
