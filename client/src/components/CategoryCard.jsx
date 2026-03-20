import ProgressRing from './ProgressRing';
import { getProgressPercent } from '../utils/helpers';

export default function CategoryCard({ category, onClick, onDelete }) {
  const icons = ['📚', '💻', '🧮', '🔬', '📖', '🎯', '🧠', '⚡'];
  const icon = icons[Math.abs(category.name.charCodeAt(0)) % icons.length];
  const progress = getProgressPercent(category.completedTopics, category.totalTopics);

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(category._id);
  };

  return (
    <div className="category-card" onClick={onClick}>
      <div className="category-card-header">
        <div className="category-card-icon">{icon}</div>
        <ProgressRing progress={progress} size={48} strokeWidth={3} textSize="small" />
      </div>

      <h3>{category.name}</h3>
      <p>{category.description || 'No description'}</p>

      <div className="category-card-footer">
        <span className="category-card-count">
          <span>{category.completedTopics || 0}</span> / {category.totalTopics || 0} topics
        </span>
        <button
          className="category-delete-btn"
          style={{ position: 'relative', zIndex: 10 }}
          onClick={handleDelete}
          title="Delete category"
        >
          🗑
        </button>
      </div>
    </div>
  );
}
