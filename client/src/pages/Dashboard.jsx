import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, createCategory, deleteCategory, getDueTopics } from '../api';
import { useAuth } from '../context/AuthContext';
import CategoryCard from '../components/CategoryCard';
import Modal from '../components/Modal';
import ActivityCalendar from '../components/ActivityCalendar';
import ProgressRing from '../components/ProgressRing';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';
import { Library, Zap, Calendar, Flame, Laptop, Calculator, FlaskConical, ClipboardList } from '../components/Icons';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';

const PRESET_CATEGORIES = [
  { name: 'DSA', description: 'Data Structures & Algorithms', type: 'dsa' },
  { name: 'Books', description: 'Book reading tracker', type: 'books' },
  { name: 'Theory Subjects', description: 'CS theory & fundamentals', type: 'theory' },
  { name: 'Practical', description: 'Hands-on projects & labs', type: 'practical' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [dueCount, setDueCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const handleDeleteCategory = (categoryId) => {
    setCategoryToDelete(categoryId);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory(categoryToDelete);
      fetchData();
      toast('Category deleted successfully', 'info');
    } catch (err) {
      console.error('Delete category error:', err);
      toast(err.response?.data?.message || 'Failed to delete category', 'error');
    } finally {
      setCategoryToDelete(null);
      setShowConfirm(false);
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
    <div className="max-w-[1400px] mx-auto flex flex-col gap-8 animate-[fadeIn_0.5s_ease]">
      <div className="bg-card border border-border rounded-xl p-6 md:p-8 md:px-10 flex flex-col md:flex-row items-center md:items-center justify-between gap-6 md:gap-10 shadow-md relative overflow-hidden before:absolute before:top-0 before:left-0 before:right-0 before:h-1 before:bg-accent-gradient animate-[slideUp_0.4s_ease]">
        <div className="flex flex-col text-center md:text-left">
          <div className="text-accent-primary font-semibold text-[1.1rem] mb-1.5 uppercase tracking-[1px]">{formattedDate}</div>
          <h1 className="text-[2.5rem] font-extrabold mb-2 tracking-tight bg-accent-gradient bg-clip-text text-transparent">{greeting}, {user?.name?.split(' ')[0] || 'Learner'}.</h1>
          <p className="text-customText-secondary text-[1.1rem]">Ready to continue your journey?</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 w-full md:w-auto mt-4 md:mt-0 justify-center">
           <div className="flex flex-row sm:flex-col gap-6 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex flex-col text-center sm:text-left flex-1 sm:flex-none">
                <span className="text-[1.75rem] font-bold text-customText-primary leading-[1.1]">{categories.length}</span>
                <span className="text-[0.7rem] sm:text-[0.85rem] text-customText-muted uppercase tracking-[0.5px] mt-1 font-semibold">Categories</span>
              </div>
              <div className="flex flex-col text-center sm:text-left flex-1 sm:flex-none">
                <span className="text-[1.75rem] font-bold text-customText-primary leading-[1.1]">{totalTopics}</span>
                <span className="text-[0.7rem] sm:text-[0.85rem] text-customText-muted uppercase tracking-[0.5px] mt-1 font-semibold">Total Topics</span>
              </div>
           </div>
           <div className="flex flex-row sm:flex-col gap-6 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex flex-col text-center sm:text-left flex-1 sm:flex-none">
                <span className="text-[1.75rem] font-bold leading-[1.1]" style={{color: dueCount > 0 ? 'var(--warning)' : 'var(--text-primary)'}}>{dueCount}</span>
                <span className="text-[0.7rem] sm:text-[0.85rem] text-customText-muted uppercase tracking-[0.5px] mt-1 font-semibold">Due Revision</span>
              </div>
              <div className="flex flex-col text-center sm:text-left flex-1 sm:flex-none">
                <span className="text-[1.75rem] font-bold text-customText-primary leading-[1.1]">{overallProgress}%</span>
                <span className="text-[0.7rem] sm:text-[0.85rem] text-customText-muted uppercase tracking-[0.5px] mt-1 font-semibold">Mastered</span>
              </div>
           </div>
           <div className="mt-2 sm:mt-0 flex justify-center w-full sm:w-auto">
              <ProgressRing progress={overallProgress} size={100} strokeWidth={8} textSize="medium" />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6 items-start">
         <div className="w-full">
            <h2 className="text-[1.25rem] font-bold mb-5 text-customText-primary flex items-center gap-[10px]"><Library size={20} className="align-text-bottom" /> Your Subjects</h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5 animate-[slideUp_0.4s_ease]" style={{ animationDelay: '0.1s' }}>
              {categories.map((category) => (
                <CategoryCard
                  key={category._id}
                  category={category}
                  onClick={() => navigate(`/category/${category._id}`)}
                  onDelete={handleDeleteCategory}
                />
              ))}

              <div className="bg-card border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center gap-4 text-customText-secondary transition-all duration-200 cursor-pointer min-h-[160px] hover:border-accent-primary hover:text-accent-primary hover:bg-accent-primary/5" onClick={() => setShowModal(true)}>
                <div className="w-12 h-12 bg-border rounded-full flex items-center justify-center text-[24px] font-bold transition-all duration-200 text-customText-secondary group-hover:bg-accent-primary/20 group-hover:text-accent-primary">+</div>
                <span className="font-semibold text-[1rem]">Add New Category</span>
              </div>
            </div>
         </div>
         
         <div className="flex flex-col gap-6 md:sticky md:top-8 animate-[slideUp_0.4s_ease]" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-[1.25rem] font-bold mb-5 text-customText-primary flex items-center gap-[10px]"><Zap size={20} className="align-text-bottom" /> Priority Actions</h2>
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm flex flex-col gap-3">
               <button className="btn btn-primary w-full justify-center" onClick={() => setShowModal(true)}>+ New Subject</button>
               <button className="btn btn-secondary w-full justify-center" onClick={() => navigate('/todo')}><ClipboardList size={18} className="mr-2" /> Weekly Planner</button>
            </div>
         </div>
      </div>

      <div className="animate-[slideUp_0.4s_ease] w-full" style={{ animationDelay: '0.3s' }}>
         <h2 className="text-[1.25rem] font-bold mb-5 text-customText-primary flex items-center gap-[10px]"><Flame size={20} className="align-text-bottom" /> Consistency Streak</h2>
         <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
            <ActivityCalendar />
         </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Category">
        {/* Preset Categories */}
        {availablePresets.length > 0 && (
          <div className="mb-6">
            <label className="block text-[0.85rem] font-medium text-customText-secondary mb-2.5">
              Quick Add
            </label>
            <div className="grid grid-cols-2 gap-3">
              {availablePresets.map((preset) => (
                <button
                  key={preset.name}
                  className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg text-customText-primary font-medium text-[0.95rem] cursor-pointer transition-all duration-200 hover:border-accent-primary hover:text-accent-primary hover:bg-accent-primary/5 hover:-translate-y-[2px]"
                  onClick={() => handlePresetCreate(preset)}
                >
                  <span className="text-accent-primary flex items-center justify-center">
                    {preset.name === 'DSA' ? <Laptop size={20} /> : preset.name === 'Books' ? <Library size={20} /> : preset.name === 'Theory Subjects' ? <Calculator size={20} /> : <FlaskConical size={20} />}
                  </span>
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
            <div className="text-center text-customText-muted text-[0.8rem] my-4 mt-6">
              — or create custom —
            </div>
          </div>
        )}

        <form onSubmit={handleCreate}>
          <div className="mb-5">
            <label className="block text-[0.85rem] font-medium text-customText-secondary mb-2">Category Name</label>
            <input
              type="text"
              placeholder="e.g. System Design, Web Dev"
              className="w-full px-4 py-3 bg-input border border-border rounded-md text-customText-primary text-[0.95rem] transition-colors duration-200 focus:border-accent-primary outline-none focus:ring-1 focus:ring-accent-primary"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="mb-5">
            <label className="block text-[0.85rem] font-medium text-customText-secondary mb-2">Description (optional)</label>
            <textarea
              placeholder="Brief description of this category"
              className="w-full px-4 py-3 bg-input border border-border rounded-md text-customText-primary text-[0.95rem] transition-colors duration-200 focus:border-accent-primary outline-none focus:ring-1 focus:ring-accent-primary min-h-[100px] resize-y"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border">
            <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Category
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Category?"
        message="Are you sure you want to delete this category? All its sections and topics will be permanently lost."
        confirmText="Delete"
        confirmVariant="danger"
      />
    </div>
  );
}
