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
    <div className="group relative bg-card border border-border rounded-xl p-6 cursor-pointer transition-all duration-300 shadow-sm overflow-hidden hover:-translate-y-1 hover:shadow-lg hover:border-accent-primary after:absolute after:bottom-0 after:left-0 after:h-1 after:w-full after:bg-accent-gradient after:opacity-0 after:transition-opacity after:duration-300 hover:after:opacity-100 flex flex-col" onClick={onClick}>
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-lg bg-accent-primary/10 text-[24px] flex items-center justify-center">{icon}</div>
        <ProgressRing progress={progress} size={48} strokeWidth={3} textSize="small" />
      </div>

      <h3 className="font-bold text-[1.2rem] text-customText-primary mb-2">{category.name}</h3>
      <p className="text-customText-secondary text-[0.9rem] line-clamp-2 min-h-[40px] mb-4">{category.description || 'No description'}</p>

      <div className="flex justify-between items-center mt-auto pt-4 border-t border-border">
        <span className="text-[0.85rem] text-customText-muted font-medium">
          <span className="text-customText-primary font-bold">{category.completedTopics || 0}</span> / {category.totalTopics || 0} topics
        </span>
        <button
          className="border-none bg-transparent text-customText-muted cursor-pointer p-1.5 rounded-md opacity-100 md:opacity-0 transition-all duration-200 md:group-hover:opacity-100 hover:!text-danger hover:bg-[#e74c3c]/10"
          style={{ position: 'relative', zIndex: 10 }}
          onClick={handleDelete}
          title="Delete category"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
      </div>
    </div>
  );
}
