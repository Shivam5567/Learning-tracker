import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, createCategory, deleteCategory, getDueTopics } from '../api';
import CategoryCard from '../components/CategoryCard';
import Modal from '../components/Modal';

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

  const totalTopics = categories.reduce((sum, c) => sum + (c.totalTopics || 0), 0);
  const completedTopics = categories.reduce((sum, c) => sum + (c.completedTopics || 0), 0);
  const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="dashboard fade-in">
      <div className="dashboard-header">
        <h1>Learning Tracker</h1>
        <p>Track your progress and revise efficiently with spaced repetition</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card slide-up">
          <div className="stat-value">{categories.length}</div>
          <div className="stat-label">Categories</div>
        </div>
        <div className="stat-card slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="stat-value">{totalTopics}</div>
          <div className="stat-label">Total Topics</div>
        </div>
        <div className="stat-card slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="stat-value">{overallProgress}%</div>
          <div className="stat-label">Overall Progress</div>
        </div>
        <div className="stat-card slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="stat-value" style={{ color: dueCount > 0 ? '#e74c3c' : 'var(--success)' }}>
            {dueCount}
          </div>
          <div className="stat-label">Due for Revision</div>
        </div>
      </div>

      <div className="categories-grid">
        {categories.map((category) => (
          <CategoryCard
            key={category._id}
            category={category}
            onClick={() => navigate(`/category/${category._id}`)}
          />
        ))}

        <div className="category-card add-new" onClick={() => setShowModal(true)}>
          <div className="add-icon">+</div>
          <span>Add New Category</span>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Category">
        <form onSubmit={handleCreate}>
          <div className="modal-field">
            <label>Category Name</label>
            <input
              type="text"
              placeholder="e.g. DSA, Books, Theory Subjects"
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
