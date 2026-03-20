import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import {
  getCategory,
  addSection,
  deleteSection,
  addTopic,
  deleteTopic,
  completeTopic,
  reviseTopic,
  importTopics,
  resetSection,
} from '../api';
import ProgressRing from '../components/ProgressRing';
import SectionAccordion from '../components/SectionAccordion';
import Modal from '../components/Modal';
import { getProgressPercent, getRevisionLabel } from '../utils/helpers';

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
  const [newTopicTotal, setNewTopicTotal] = useState(1);

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

  const quote = quotes[Math.floor(Math.random() * quotes.length)];

  useEffect(() => {
    fetchCategory();
  }, [id]);

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
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;
    try {
      await addTopic(id, activeSectionId, {
        name: newTopicName,
        totalItems: parseInt(newTopicTotal) || 1,
      });
      setNewTopicName('');
      setNewTopicTotal(1);
      setShowTopicModal(false);
      fetchCategory();
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error('Delete topic error:', err);
    }
  };

  const handleDeleteSection = async (sectionId) => {
    if (window.confirm('Are you sure you want to delete this section and all its topics?')) {
      try {
        await deleteSection(id, sectionId);
        fetchCategory();
      } catch (err) {
        console.error('Delete section error:', err);
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
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const totalTopics = category.totalTopics || 0;
  const completedTopics = category.completedTopics || 0;
  const progress = getProgressPercent(completedTopics, totalTopics);

  // Filter sections for revision due
  const getFilteredSections = () => {
    let sections = category.sections || [];

    if (searchQuery) {
      sections = sections.map(section => ({
        ...section,
        topics: section.topics.filter(t =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(s => s.topics.length > 0);
    }

    if (filter === 'revision') {
      const now = new Date();
      sections = sections.map(section => ({
        ...section,
        topics: section.topics.filter(t =>
          t.completed && t.nextReview && new Date(t.nextReview) <= now
        ),
      })).filter(s => s.topics.length > 0);
    }

    return sections;
  };

  const filteredSections = getFilteredSections();

  // Due topics for sidebar
  const allDueTopics = [];
  (category.sections || []).forEach(section => {
    section.topics.forEach(topic => {
      if (topic.completed && topic.nextReview) {
        allDueTopics.push({
          ...topic,
          sectionName: section.name,
        });
      }
    });
  });
  allDueTopics.sort((a, b) => new Date(a.nextReview) - new Date(b.nextReview));

  return (
    <div className="category-page fade-in">
      <div className="category-main">
        {/* Header */}
        <div className="category-header">
          <div className="category-header-top">
            <button className="back-btn" onClick={() => navigate('/')}>←</button>
            <h1>{category.name}</h1>
            <div className="category-header-actions">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowImportModal(true)}
              >
                📥 Import
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowSectionModal(true)}
              >
                + Add Section
              </button>
            </div>
          </div>

          <div className="category-progress">
            <ProgressRing progress={progress} size={72} strokeWidth={5} textSize="medium" />
            <div className="category-progress-info">
              <h3>Overall Progress</h3>
              <div className="progress-text">
                {completedTopics} <span>/ {totalTopics}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="category-filters">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Topics
          </button>
          <button
            className={`filter-tab ${filter === 'revision' ? 'active' : ''}`}
            onClick={() => setFilter('revision')}
          >
            Revision Due
          </button>
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search topics..."
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
              onToggleComplete={(topic) => handleToggleComplete(topic, section._id)}
              onDeleteTopic={(topic) => handleDeleteTopic(topic, section._id)}
              onAddTopic={openAddTopic}
              onDeleteSection={handleDeleteSection}
              onResetSection={handleResetSection}
            />
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>
              {filter === 'revision'
                ? 'No topics due for revision!'
                : 'No sections yet. Add a section to get started.'}
            </p>
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      <div className="category-sidebar">
        {/* Progress Card */}
        <div className="sidebar-card">
          <h3>Progress</h3>
          <div className="progress-donut-center">
            <ProgressRing progress={progress} size={120} strokeWidth={8} textSize="large" />
          </div>
        </div>

        {/* Upcoming Revisions */}
        <div className="sidebar-card">
          <h3>Upcoming Revisions</h3>
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

        {/* Quote */}
        <div className="quote-card">
          <div className="quote-mark">❝</div>
          <div className="quote-text">{quote.text}</div>
          <div className="quote-author">— {quote.author}</div>
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
          <div className="modal-field">
            <label>Total Items</label>
            <input
              type="number"
              min="1"
              placeholder="Number of sub-items"
              value={newTopicTotal}
              onChange={(e) => setNewTopicTotal(e.target.value)}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowTopicModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">Add Topic</button>
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
