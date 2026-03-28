import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import {
  getCategory,
  addSection,
  deleteSection,
  addTopic,
  editTopic,
  deleteTopic,
  completeTopic,
  reviseTopic,
  importTopics,
  resetSection,
} from '../api';
import ProgressRing from '../components/ProgressRing';
import SectionAccordion from '../components/SectionAccordion';
import Modal from '../components/Modal';
import DsaStatsWidget from '../components/DsaStatsWidget';
import { getProgressPercent, getRevisionLabel } from '../utils/helpers';
import { getFeatures } from '../utils/categoryConfig';
import { useToast } from '../context/ToastContext';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';

const quotes = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Don't cry in a corner if you want something, mehnat kar, best ban aur cheen le.", author: "Striver" },
  { text: "Learning is not attained by chance, it must be sought for with ardor.", author: "Abigail Adams" },
  { text: "The more that you read, the more things you will know.", author: "Dr. Seuss" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
];

export default function CategoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(null);
  const [newSectionName, setNewSectionName] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicUrl, setNewTopicUrl] = useState('');
  const [newTopicNotes, setNewTopicNotes] = useState('');
  const [newTopicDifficulty, setNewTopicDifficulty] = useState('Easy');
  const [newReadingStatus, setNewReadingStatus] = useState('Not Started');
  const [newPagesRead, setNewPagesRead] = useState(0);
  const [newTotalPages, setNewTotalPages] = useState(0);
  const [newPriority, setNewPriority] = useState('Medium');
  const [newProjectStatus, setNewProjectStatus] = useState('Planning');

  // Edit Topic Modal
  const [showEditTopicModal, setShowEditTopicModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editTopicName, setEditTopicName] = useState('');
  const [editTopicUrl, setEditTopicUrl] = useState('');
  const [editTopicNotes, setEditTopicNotes] = useState('');
  const [editTopicDifficulty, setEditTopicDifficulty] = useState('Easy');
  const [editReadingStatus, setEditReadingStatus] = useState('Not Started');
  const [editPagesRead, setEditPagesRead] = useState(0);
  const [editTotalPages, setEditTotalPages] = useState(0);
  const [editPriority, setEditPriority] = useState('Medium');
  const [editProjectStatus, setEditProjectStatus] = useState('Planning');

  // Revision modal
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionTopic, setRevisionTopic] = useState(null);
  const [revisionSectionId, setRevisionSectionId] = useState(null);

  // Import modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState(null);
  const [importError, setImportError] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState('');
  const fileInputRef = useRef(null);
  const searchInputRef = useRef(null);

  const quote = useMemo(() => quotes[Math.floor(Math.random() * quotes.length)], []);

  useEffect(() => {
    fetchCategory();
  }, [id]);

  // ---- Keyboard Shortcuts ----
  const anyModalOpen = showSectionModal || showTopicModal || showEditTopicModal || showRevisionModal || showImportModal;

  // N → Add topic to first section
  useKeyboardShortcut('n', () => {
    if (category?.sections?.length > 0) {
      openAddTopic(category.sections[category.sections.length - 1]._id);
    } else {
      setShowSectionModal(true);
    }
  }, { disabled: anyModalOpen || !category });

  // S → Add section
  useKeyboardShortcut('s', () => setShowSectionModal(true), { disabled: anyModalOpen });

  // F → Focus search
  useKeyboardShortcut('f', () => searchInputRef.current?.focus(), { disabled: anyModalOpen });

  // 1 → All filter, 2 → Revision Due filter
  useKeyboardShortcut('1', () => setFilter('all'), { disabled: anyModalOpen });
  useKeyboardShortcut('2', () => setFilter('revision'), { disabled: anyModalOpen });
  // ----------------------------

  const fetchCategory = async () => {
    try {
      const { data } = await getCategory(id);
      setCategory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = async (e) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;
    try {
      await addSection(id, { name: newSectionName });
      setNewSectionName('');
      setShowSectionModal(false);
      fetchCategory();
      toast(`Section "${newSectionName}" added!`, 'success');
    } catch (err) {
      console.error(err);
      toast('Failed to add section', 'error');
    }
  };

  const handleAddTopic = async (e, keepOpen = false) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    const name = newTopicName;
    try {
      await addTopic(id, activeSectionId, {
        name,
        totalItems: 1,
        url: newTopicUrl,
        notes: newTopicNotes,
        difficulty: newTopicDifficulty,
        readingStatus: newReadingStatus,
        pagesRead: newPagesRead,
        totalPages: newTotalPages,
        priority: newPriority,
        projectStatus: newProjectStatus,
      });
      setNewTopicName('');
      setNewTopicUrl('');
      setNewTopicNotes('');
      setNewTopicDifficulty('Easy');
      setNewReadingStatus('Not Started');
      setNewPagesRead(0);
      setNewTotalPages(0);
      setNewPriority('Medium');
      setNewProjectStatus('Planning');
      if (!keepOpen) setShowTopicModal(false);
      fetchCategory();
      toast(`"${name}" added!`, 'success');
    } catch (err) {
      console.error(err);
      toast('Failed to add topic', 'error');
    }
  };

  const openEditTopic = (topic, sectionId) => {
    setEditingTopic(topic);
    setEditingSectionId(sectionId);
    setEditTopicName(topic.name);
    setEditTopicUrl(topic.url || '');
    setEditTopicNotes(topic.notes || '');
    setEditTopicDifficulty(topic.difficulty || 'Easy');
    setEditReadingStatus(topic.readingStatus || 'Not Started');
    setEditPagesRead(topic.pagesRead || 0);
    setEditTotalPages(topic.totalPages || 0);
    setEditPriority(topic.priority || 'Medium');
    setEditProjectStatus(topic.projectStatus || 'Planning');
    setShowEditTopicModal(true);
  };

  const handleEditTopic = async (e) => {
    e.preventDefault();
    if (!editTopicName.trim()) return;
    try {
      await editTopic(id, editingSectionId, editingTopic._id, {
        name: editTopicName,
        totalItems: 1,
        url: editTopicUrl,
        notes: editTopicNotes,
        difficulty: editTopicDifficulty,
        readingStatus: editReadingStatus,
        pagesRead: editPagesRead,
        totalPages: editTotalPages,
        priority: editPriority,
        projectStatus: editProjectStatus,
      });
      setShowEditTopicModal(false);
      setEditingTopic(null);
      fetchCategory();
      toast('Topic updated ✓', 'success');
    } catch (err) {
      console.error(err);
      toast('Failed to update topic', 'error');
    }
  };

  const handleToggleComplete = async (topic, sectionId) => {
    // If topic is already completed and revision is due, show revision modal
    if (topic.completed && topic.nextReview) {
      const now = new Date();
      const reviewDate = new Date(topic.nextReview);
      if (reviewDate <= now) {
        setRevisionTopic(topic);
        setRevisionSectionId(sectionId);
        setShowRevisionModal(true);
        return;
      }
    }

    try {
      await completeTopic({
        categoryId: id,
        sectionId,
        topicId: topic._id,
        quality: 4,
      });
      fetchCategory();
      toast(topic.completed ? 'Marked incomplete' : 'Topic completed! ✓', topic.completed ? 'info' : 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevision = async (quality) => {
    try {
      await reviseTopic({
        categoryId: id,
        sectionId: revisionSectionId,
        topicId: revisionTopic._id,
        quality,
      });
      setShowRevisionModal(false);
      setRevisionTopic(null);
      fetchCategory();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTopic = async (topic, sectionId) => {
    try {
      await deleteTopic(id, sectionId, topic._id);
      fetchCategory();
      toast(`"${topic.name}" deleted`, 'info');
    } catch (err) {
      console.error('Delete topic error:', err);
      toast('Failed to delete topic', 'error');
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (window.confirm('Are you sure you want to delete this section and all its topics?')) {
      try {
        await deleteSection(id, sectionId);
        fetchCategory();
        toast('Section deleted', 'info');
      } catch (err) {
        console.error('Delete section error:', err);
        toast('Failed to delete section', 'error');
      }
    }
  };

  const handleResetSection = async (sectionId) => {
    if (window.confirm('Are you sure you want to reset all progress in this section?')) {
      try {
        await resetSection(id, sectionId);
        fetchCategory();
      } catch (err) {
        console.error('Reset section error:', err);
      }
    }
  };

  const openAddTopic = (sectionId) => {
    setActiveSectionId(sectionId);
    setShowTopicModal(true);
  };

  // ========================
  // IMPORT HANDLERS
  // ========================

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    processFile(file);
  };

  const processFile = (file) => {
    setImportError('');
    setImportResult('');
    setImportData(null);

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validTypes.includes(file.type) && !validExtensions.includes(ext)) {
      setImportError('Please upload an Excel (.xlsx, .xls) or CSV (.csv) file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (jsonData.length === 0) {
          setImportError('The file appears to be empty');
          return;
        }

        // Parse into sections/topics structure
        // Expected columns: Section, Topic, TotalItems (or variations)
        const parsed = parseSheetData(jsonData);
        if (parsed.length === 0) {
          setImportError('Could not find valid data. Make sure your file has columns: Section, Topic (and optionally TotalItems)');
          return;
        }

        setImportData(parsed);
      } catch (err) {
        setImportError('Failed to parse file: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const parseSheetData = (rows) => {
    // Find column names (case-insensitive)
    const columns = Object.keys(rows[0]);
    const findCol = (keywords) => columns.find(c =>
      keywords.some(k => c.toLowerCase().trim().includes(k))
    );

    const sectionCol = findCol(['section', 'unit', 'chapter', 'module', 'category']);
    const topicCol = findCol(['topic', 'problem', 'name', 'title', 'question', 'item']);
    const totalCol = findCol(['total', 'count', 'items', 'number', 'qty']);

    if (!topicCol) return [];

    // Group topics by section
    const sectionsMap = new Map();
    let currentSection = 'Imported Topics'; // Default section name

    for (const row of rows) {
      const topicName = String(row[topicCol] || '').trim();
      if (!topicName) continue;

      if (sectionCol && row[sectionCol]) {
        currentSection = String(row[sectionCol]).trim();
      }

      if (!sectionsMap.has(currentSection)) {
        sectionsMap.set(currentSection, []);
      }

      sectionsMap.get(currentSection).push({
        name: topicName,
        totalItems: parseInt(row[totalCol]) || 1,
      });
    }

    return Array.from(sectionsMap.entries()).map(([name, topics]) => ({
      name,
      topics,
    }));
  };

  const handleImport = async () => {
    if (!importData) return;
    setImportLoading(true);
    setImportError('');
    try {
      const { data } = await importTopics(id, { sections: importData });
      setImportResult(data.message);
      setImportData(null);
      fetchCategory();
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setImportError(err.response?.data?.message || 'Import failed');
    } finally {
      setImportLoading(false);
    }
  };

  const closeImportModal = () => {
    setShowImportModal(false);
    setImportData(null);
    setImportError('');
    setImportResult('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="empty-state">
        <p>Category not found</p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const totalTopics = category.totalTopics || 0;
  const completedTopics = category.completedTopics || 0;
  const masteredTopics = category.sections.reduce((sum, s) => sum + s.topics.filter(t => t.isMastered).length, 0);
  const progress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const DIFFICULTY_ORDER = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
  const now = new Date();
  const filteredSections = category.sections.map(section => {
    // 1. Filter topics based on tab and search
    let filteredTopics = section.topics.filter(topic => {
      const matchesSearch = topic.name.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (filter === 'revision') {
        const isDue = topic.completed && topic.nextReview && !topic.isMastered && new Date(topic.nextReview) <= now;
        return isDue;
      }
      if (filter === 'mastered') {
        return topic.isMastered;
      }
      return true; // 'all'
    });

    // 2. Sort topics by difficulty if category is DSA
    if (category.type === 'dsa') {
      filteredTopics.sort((a, b) => {
        const orderA = DIFFICULTY_ORDER[a.difficulty] || 99;
        const orderB = DIFFICULTY_ORDER[b.difficulty] || 99;
        return orderA - orderB;
      });
    }

    return { ...section, topics: filteredTopics };
  }).filter(section => section.topics.length > 0);

  const features = getFeatures(category);

  // For the "Upcoming Revisions" sidebar widget
  const allDueTopics = [];
  category.sections.forEach(s => {
    s.topics.forEach(t => {
      if (t.completed && t.nextReview && !t.isMastered) {
        allDueTopics.push({
          ...t,
          sectionName: s.name,
        });
      }
    });
  });
  allDueTopics.sort((a, b) => new Date(a.nextReview) - new Date(b.nextReview));

  return (
    <div className="bento-dashboard fade-in">
      {/* Hero Header */}
      <div className="bento-hero slide-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', width: '44px', height: '44px', borderRadius: '50%', color: 'white', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>←</button>
          <div>
            <h1 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.5px', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{category.name}</h1>
            <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '1rem' }}>
              {completedTopics} of {totalTopics} completed • {masteredTopics} Mastered 🏆
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ProgressRing progress={progress} size={64} strokeWidth={5} textSize="small" />
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={() => setShowImportModal(true)}>📥 Import</button>
            <button className="btn btn-primary" onClick={() => setShowSectionModal(true)}>+ Add Section</button>
          </div>
        </div>
      </div>

      {/* Two-Column Grid */}
      <div className="bento-main-grid">
        {/* Left Column — Filters + Sections */}
        <div>
          {/* Filters */}
          <div className="category-filters">
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Topics
            </button>
            {features.revision && (
              <>
                <button
                  className={`filter-tab ${filter === 'revision' ? 'active' : ''}`}
                  onClick={() => setFilter('revision')}
                >
                  Revision Due
                </button>
                <button
                  className={`filter-tab ${filter === 'mastered' ? 'active' : ''}`}
                  onClick={() => setFilter('mastered')}
                >
                  Mastered 🏆
                </button>
              </>
            )}
            <input
              ref={searchInputRef}
              type="text"
              className="search-input"
              placeholder="🔍 Search topics... (F)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sections */}
          {filteredSections.length > 0 ? (
            filteredSections.map((section) => (
              <SectionAccordion
                key={section._id}
                section={section}
                features={features}
                onToggleComplete={(topic) => handleToggleComplete(topic, section._id)}
                onDeleteTopic={(topic) => handleDeleteTopic(topic, section._id)}
                onEditTopic={openEditTopic}
                onAddTopic={openAddTopic}
                onDeleteSection={handleDeleteSection}
                onResetSection={handleResetSection}
              />
            ))
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                {filter === 'revision' ? '✅' : filter === 'mastered' ? '🏆' : '📋'}
              </div>
              <p>
                {filter === 'revision'
                  ? 'All caught up! No topics due for revision.'
                  : filter === 'mastered'
                  ? 'No topics mastered yet. Keep practicing!'
                  : 'No sections yet. Add a section to get started.'}
              </p>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="bento-sidebar">
          {/* Progress Card */}
          <div className="bento-widget">
            <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Subject Mastery</h3>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ProgressRing progress={progress} size={140} strokeWidth={10} textSize="large" />
            </div>
            <div style={{ textAlign: 'center', marginTop: '16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Completed {completedTopics} out of {totalTopics} topics
            </div>
          </div>

          {/* DSA Stats — only for difficulty-enabled categories */}
          {features.difficulty && (
            <DsaStatsWidget sections={category.sections} />
          )}
          {/* Upcoming Revisions — only for revision-enabled categories */}
          {features.revision && (
            <div className="bento-widget">
              <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', color: 'var(--text-primary)' }}>Upcoming Revisions</h3>
              {allDueTopics.length > 0 ? (
                <ul className="revision-list">
                  {allDueTopics.slice(0, 5).map((topic) => (
                    <li key={topic._id}>
                      <span className="topic-name">{topic.name}</span>
                      <span className={`revision-badge ${
                        new Date(topic.nextReview) <= new Date() ? 'due' : 'upcoming'
                      }`}>
                        {getRevisionLabel(topic.nextReview)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  Complete topics to see revision schedule
                </p>
              )}
            </div>
          )}


        </div>
      </div>

      {/* Add Section Modal */}
      <Modal isOpen={showSectionModal} onClose={() => setShowSectionModal(false)} title="Add Section">
        <form onSubmit={handleAddSection}>
          <div className="modal-field">
            <label>Section Name</label>
            <input
              type="text"
              placeholder="e.g. Learn the Basics, Arrays, Sorting"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowSectionModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">Add Section</button>
          </div>
        </form>
      </Modal>

      {/* Add Topic Modal */}
      <Modal isOpen={showTopicModal} onClose={() => setShowTopicModal(false)} title="Add Topic">
        <form onSubmit={handleAddTopic}>
          <div className="modal-field">
            <label>Topic Name</label>
            <input
              type="text"
              placeholder="e.g. Build-up Logical Thinking"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              autoFocus
            />
          </div>
          {features.url && (
            <div className="modal-field">
              <label>Link / URL (Optional)</label>
              <input
                type="url"
                placeholder="e.g. https://leetcode.com/problems/..."
                value={newTopicUrl}
                onChange={(e) => setNewTopicUrl(e.target.value)}
              />
            </div>
          )}
          {features.notes && (
            <div className="modal-field">
              <label>Notes (Optional)</label>
              <textarea
                placeholder="Jot down approaches or things to remember..."
                value={newTopicNotes}
                onChange={(e) => setNewTopicNotes(e.target.value)}
                rows="3"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>
          )}
          {features.difficulty && (
            <div className="modal-field">
              <label>Difficulty</label>
              <select
                value={newTopicDifficulty}
                onChange={(e) => setNewTopicDifficulty(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          )}
          {features.readingStatus && (
            <div className="modal-field">
              <label>Reading Status</label>
              <select
                value={newReadingStatus}
                onChange={(e) => setNewReadingStatus(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
              >
                <option value="Not Started">Not Started</option>
                <option value="Reading">Reading</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          )}
          {features.pagesRead && (
            <div className="modal-field" style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label>Pages Read</label>
                <input type="number" min="0" value={newPagesRead} onChange={(e) => setNewPagesRead(Number(e.target.value))} />
              </div>
              <div style={{ flex: 1 }}>
                <label>Total Pages</label>
                <input type="number" min="0" value={newTotalPages} onChange={(e) => setNewTotalPages(Number(e.target.value))} />
              </div>
            </div>
          )}
          {features.priority && (
            <div className="modal-field">
              <label>Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          )}
          {features.projectStatus && (
            <div className="modal-field">
              <label>Project Status</label>
              <select
                value={newProjectStatus}
                onChange={(e) => setNewProjectStatus(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
              >
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
          )}
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowTopicModal(false)}>
              Cancel
            </button>
            <button type="button" className="btn btn-secondary" onClick={(e) => handleAddTopic(e, true)}>
              + Add Another
            </button>
            <button type="submit" className="btn btn-primary">Add Topic</button>
          </div>
        </form>
      </Modal>

      {/* Edit Topic Modal */}
      <Modal isOpen={showEditTopicModal} onClose={() => setShowEditTopicModal(false)} title="Edit Topic">
        <form onSubmit={handleEditTopic}>
          <div className="modal-field">
            <label>Topic Name</label>
            <input
              type="text"
              value={editTopicName}
              onChange={(e) => setEditTopicName(e.target.value)}
              required
            />
          </div>
          {features.url && (
            <div className="modal-field">
              <label>Link / URL (Optional)</label>
              <input
                type="url"
                placeholder="e.g. https://leetcode.com/problems/..."
                value={editTopicUrl}
                onChange={(e) => setEditTopicUrl(e.target.value)}
              />
            </div>
          )}
          {features.notes && (
            <div className="modal-field">
              <label>Notes (Optional)</label>
              <textarea
                placeholder="Jot down approaches or things to remember..."
                value={editTopicNotes}
                onChange={(e) => setEditTopicNotes(e.target.value)}
                rows="3"
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'vertical', fontFamily: 'inherit' }}
              />
            </div>
          )}
          {features.difficulty && (
            <div className="modal-field">
              <label>Difficulty</label>
              <select
                value={editTopicDifficulty}
                onChange={(e) => setEditTopicDifficulty(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          )}
          {features.readingStatus && (
            <div className="modal-field">
              <label>Reading Status</label>
              <select
                value={editReadingStatus}
                onChange={(e) => setEditReadingStatus(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
              >
                <option value="Not Started">Not Started</option>
                <option value="Reading">Reading</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          )}
          {features.pagesRead && (
            <div className="modal-field" style={{ display: 'flex', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <label>Pages Read</label>
                <input type="number" min="0" value={editPagesRead} onChange={(e) => setEditPagesRead(Number(e.target.value))} />
              </div>
              <div style={{ flex: 1 }}>
                <label>Total Pages</label>
                <input type="number" min="0" value={editTotalPages} onChange={(e) => setEditTotalPages(Number(e.target.value))} />
              </div>
            </div>
          )}
          {features.priority && (
            <div className="modal-field">
              <label>Priority</label>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          )}
          {features.projectStatus && (
            <div className="modal-field">
              <label>Project Status</label>
              <select
                value={editProjectStatus}
                onChange={(e) => setEditProjectStatus(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
              >
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
          )}
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowEditTopicModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>

      {/* Revision Rating Modal */}
      <Modal
        isOpen={showRevisionModal}
        onClose={() => setShowRevisionModal(false)}
        title="How well did you remember?"
      >
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Rate your recall of: <strong>{revisionTopic?.name}</strong>
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn btn-danger" onClick={() => handleRevision(1)} style={{ flex: 1 }}>
            😵 Forgot
          </button>
          <button className="btn btn-secondary" onClick={() => handleRevision(3)} style={{ flex: 1 }}>
            😅 Hard
          </button>
          <button className="btn btn-primary" onClick={() => handleRevision(4)} style={{ flex: 1 }}>
            😊 Good
          </button>
          <button className="btn btn-primary" onClick={() => handleRevision(5)} style={{ flex: 1, background: 'var(--success)' }}>
            🎯 Easy
          </button>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal isOpen={showImportModal} onClose={closeImportModal} title="📥 Import from Excel / CSV">
        {importResult ? (
          <div>
            <div style={{
              background: 'rgba(46, 204, 113, 0.1)',
              border: '1px solid rgba(46, 204, 113, 0.3)',
              color: 'var(--success)',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '16px',
              fontSize: '0.9rem',
            }}>
              ✅ {importResult}
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={closeImportModal}>Done</button>
            </div>
          </div>
        ) : (
          <div>
            {importError && (
              <div className="auth-error" style={{ marginBottom: '16px' }}>{importError}</div>
            )}

            {/* File upload zone */}
            <div
              className="import-drop-zone"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="import-drop-icon">📄</div>
              <p>Drag & drop your file here, or <span style={{ color: 'var(--accent-primary)' }}>click to browse</span></p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Supports .xlsx, .xls, .csv</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>

            {/* Format guide */}
            <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--text-secondary)' }}>Expected format:</strong>
              <table style={{ width: '100%', marginTop: '8px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '4px 8px', color: 'var(--accent-primary)' }}>Section</th>
                    <th style={{ textAlign: 'left', padding: '4px 8px', color: 'var(--accent-primary)' }}>Topic</th>
                    <th style={{ textAlign: 'left', padding: '4px 8px', color: 'var(--accent-primary)' }}>TotalItems</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '4px 8px' }}>Arrays</td>
                    <td style={{ padding: '4px 8px' }}>Two Sum</td>
                    <td style={{ padding: '4px 8px' }}>1</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '4px 8px' }}>Arrays</td>
                    <td style={{ padding: '4px 8px' }}>Best Time to Buy</td>
                    <td style={{ padding: '4px 8px' }}>1</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Preview parsed data */}
            {importData && (
              <div style={{ marginTop: '16px' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '12px', color: 'var(--text-secondary)' }}>
                  Preview ({importData.reduce((s, sec) => s + sec.topics.length, 0)} topics in {importData.length} sections)
                </h3>
                <div style={{ maxHeight: '200px', overflowY: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', padding: '8px 12px' }}>
                  {importData.map((section, i) => (
                    <div key={i} style={{ marginBottom: '8px' }}>
                      <div style={{ fontWeight: '600', fontSize: '0.85rem', color: 'var(--accent-primary)', marginBottom: '4px' }}>
                        {section.name} ({section.topics.length})
                      </div>
                      {section.topics.slice(0, 5).map((t, j) => (
                        <div key={j} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', paddingLeft: '12px' }}>
                          • {t.name} {t.totalItems > 1 ? `(${t.totalItems} items)` : ''}
                        </div>
                      ))}
                      {section.topics.length > 5 && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '12px', fontStyle: 'italic' }}>
                          ...and {section.topics.length - 5} more
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={closeImportModal}>Cancel</button>
              {importData && (
                <button className="btn btn-primary" onClick={handleImport} disabled={importLoading}>
                  {importLoading ? 'Importing...' : `Import ${importData.reduce((s, sec) => s + sec.topics.length, 0)} Topics`}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
