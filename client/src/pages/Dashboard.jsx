import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, createCategory, deleteCategory, getDueTopics } from '../api';
import CategoryCard from '../components/CategoryCard';
import Modal from '../components/Modal';
import ActivityCalendar from '../components/ActivityCalendar';
import ProgressRing from '../components/ProgressRing';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';

const PRESET_CATEGORIES = [
  { name: 'DSA', description: 'Data Structures & Algorithms', type: 'dsa' },
  { name: 'Books', description: 'Book reading tracker', type: 'books' },
  { name: 'Theory Subjects', description: 'CS theory & fundamentals', type: 'theory' },
  { name: 'Practical', description: 'Hands-on projects & labs', type: 'practical' },
];

export default function Dashboard() {
  const [categories, setCategories] = useState([]);
  const [dueCount, setDueCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  // Keyboard shortcut: N → New Category
  useKeyboardShortcut('n', () => setShowModal(true), { disabled: showModal });

  const fetchData = async () => {
    try {
      const [catRes, dueRes] = await Promise.all([
        getCategories(),
        getDueTopics(),
      ]);
      setCategories(catRes.data);
      setDueCount(dueRes.data.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await createCategory({ name: newName, description: newDesc });
      setNewName('');
      setNewDesc('');
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePresetCreate = async (preset) => {
    // Check if this category already exists
    if (categories.some(c => c.name.toLowerCase() === preset.name.toLowerCase())) {
      return; // Already exists, skip
    }
    try {
      await createCategory(preset);
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? All its sections and topics will be permanently lost.')) {
      try {
        await deleteCategory(categoryId);
        fetchData();
      } catch (err) {
        console.error('Delete category error:', err);
        alert(err.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  const totalTopics = categories.reduce((sum, c) => sum + (c.totalTopics || 0), 0);
  const completedTopics = categories.reduce((sum, c) => sum + (c.completedTopics || 0), 0);
  const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // Filter out presets that already exist
  const existingNames = categories.map(c => c.name.toLowerCase());
  const availablePresets = PRESET_CATEGORIES.filter(
    p => !existingNames.includes(p.name.toLowerCase())
  );

  // Date and Greeting Logic
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const dateOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedDate = new Date().toLocaleDateString('en-US', dateOptions);

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="bento-dashboard fade-in">
      <div className="bento-hero slide-up">
        <div className="bento-hero-left">
          <div className="date-display">{formattedDate}</div>
          <h1>{greeting}, Learner.</h1>
          <p>Ready to continue your journey?</p>
        </div>
        <div className="bento-hero-right">
           <div className="bento-stat-group">
              <div className="bento-mini-stat">
                <span className="value">{categories.length}</span>
                <span className="label">Categories</span>
              </div>
              <div className="bento-mini-stat">
                <span className="value">{totalTopics}</span>
                <span className="label">Total Topics</span>
              </div>
           </div>
           <div className="bento-stat-group">
              <div className="bento-mini-stat">
                <span className="value" style={{color: dueCount > 0 ? 'var(--warning)' : 'var(--text-primary)'}}>{dueCount}</span>
                <span className="label">Due Revision</span>
              </div>
              <div className="bento-mini-stat">
                <span className="value">{overallProgress}%</span>
                <span className="label">Mastered</span>
              </div>
           </div>
           <ProgressRing progress={overallProgress} size={120} strokeWidth={8} textSize="large" />
        </div>
      </div>

      <div className="bento-main-grid">
         <div className="bento-main-left">
            <h2 className="bento-section-title">📚 Your Subjects</h2>
            <div className="categories-grid slide-up" style={{ animationDelay: '0.1s' }}>
              {categories.map((category) => (
                <CategoryCard
                  key={category._id}
                  category={category}
                  onClick={() => navigate(`/category/${category._id}`)}
                  onDelete={handleDeleteCategory}
                />
              ))}

              <div className="category-card add-new" onClick={() => setShowModal(true)}>
                <div className="add-icon">+</div>
                <span>Add New Category</span>
              </div>
            </div>
         </div>
         
         <div className="bento-sidebar slide-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="bento-section-title">⚡ Priority Actions</h2>
            <div className="bento-widget" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
               <button className="btn btn-primary" style={{width: '100%', justifyContent: 'center'}} onClick={() => setShowModal(true)}>+ New Subject</button>
               <button className="btn btn-secondary" style={{width: '100%', justifyContent: 'center'}} onClick={() => navigate('/todo')}>📝 Weekly Planner</button>
            </div>
         </div>
      </div>

      <div className="slide-up" style={{ width: '100%', animationDelay: '0.3s' }}>
         <h2 className="bento-section-title">🔥 Consistency Streak</h2>
         <div className="bento-widget" style={{ padding: '32px' }}>
            <ActivityCalendar />
         </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Category">
        {/* Preset Categories */}
        {availablePresets.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Quick Add
            </label>
            <div className="preset-category-grid">
              {availablePresets.map((preset) => (
                <button
                  key={preset.name}
                  className="preset-category-btn"
                  onClick={() => handlePresetCreate(preset)}
                >
                  <span className="preset-icon">
                    {preset.name === 'DSA' ? '💻' : preset.name === 'Books' ? '📚' : preset.name === 'Theory Subjects' ? '🧮' : '🔬'}
                  </span>
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', margin: '16px 0 8px' }}>
              — or create custom —
            </div>
          </div>
        )}

        <form onSubmit={handleCreate}>
          <div className="modal-field">
            <label>Category Name</label>
            <input
              type="text"
              placeholder="e.g. System Design, Web Dev"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="modal-field">
            <label>Description (optional)</label>
            <textarea
              placeholder="Brief description of this category"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Category
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
