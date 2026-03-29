import { useState, useEffect } from 'react';
import { getTodos, createTodo, updateTodo, deleteTodo } from '../api';
import { formatDate } from '../utils/helpers';
import { ClipboardList, Trash2 } from '../components/Icons';

export default function TodoPage() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDate, setActiveDate] = useState(getLocalDateString(new Date()));
  const [newTask, setNewTask] = useState('');
  const [dates, setDates] = useState([]);

  // Generate the last 7 days + today
  useEffect(() => {
    const dList = [];
    for (let i = 0; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dList.push(getLocalDateString(d));
    }
    setDates(dList);
    fetchTodos(dList[dList.length - 1], dList[0]);
  }, []);

  // Fetch todos for the 8-day range
  const fetchTodos = async (start, end) => {
    try {
      setLoading(true);
      const res = await getTodos({ startDate: start, endDate: end });
      setTodos(res.data);
    } catch (err) {
      console.error('Fetch todos error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper: YYYY-MM-DD in local timezone
  function getLocalDateString(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Display label for a date tab
  const getDateLabel = (dateStr) => {
    const todayStr = getLocalDateString(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    if (dateStr === todayStr) return 'Today';
    if (dateStr === yesterdayStr) return 'Yesterday';

    // Return the day of the week (e.g. "Mon", "Tue")
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const res = await createTodo({ text: newTask, date: activeDate });
      setTodos([...todos, res.data]);
      setNewTask('');
    } catch (err) {
      console.error('Create todo error:', err);
    }
  };

  const handleToggle = async (todo) => {
    try {
      // Optimistic update
      setTodos(todos.map(t => t._id === todo._id ? { ...t, completed: !t.completed } : t));
      await updateTodo(todo._id, { completed: !todo.completed });
    } catch (err) {
      console.error('Toggle todo error:', err);
      // Revert if error (not strictly necessary for simple app but good practice)
      fetchTodos(dates[dates.length - 1], dates[0]);
    }
  };

  const handleDelete = async (id) => {
    try {
      setTodos(todos.filter(t => t._id !== id));
      await deleteTodo(id);
    } catch (err) {
      console.error('Delete todo error:', err);
    }
  };

  const activeTodos = todos.filter(t => t.date === activeDate);
  const completedCount = activeTodos.filter(t => t.completed).length;

  if (loading && dates.length === 0) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto animate-[fadeIn_0.5s_ease] pb-6">
      <div className="mb-6 md:mb-8 text-center md:text-left">
        <h1 className="text-[1.8rem] md:text-[2.2rem] font-bold mb-2 bg-gradient-to-r from-customText-primary to-customText-secondary bg-clip-text text-transparent tracking-tight">Weekly To-Do Manager</h1>
        <p className="text-customText-secondary text-[0.95rem] md:text-[1rem]">Track your tasks up to 1 week in the past.</p>
      </div>

      <div>
        {/* Date Tabs */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
          {dates.map((d) => (
            <button
              key={d}
              className={`flex flex-col items-center justify-center py-3 px-6 bg-card border border-border rounded-md cursor-pointer transition-all duration-200 min-w-[90px] ${activeDate === d ? '!bg-[#e67e22]/10 !border-accent-primary group' : 'hover:bg-white/5 group'}`}
              onClick={() => setActiveDate(d)}
            >
              <span className={`font-semibold mb-1 transition-colors duration-200 whitespace-nowrap ${activeDate === d ? 'text-accent-primary' : 'text-customText-primary'}`}>{getDateLabel(d)}</span>
              <span className="text-[0.8rem] text-customText-muted">{d.split('-').slice(1).join('/')}</span>
            </button>
          )).reverse()}
        </div>

        {/* Task List Section */}
        <div className="bg-card border border-border rounded-xl p-5 md:p-6 shadow-md animate-[slideUp_0.4s_ease]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-6 pb-4 border-b border-border">
            <h2 className="text-[1.2rem] md:text-[1.4rem] font-semibold">{getDateLabel(activeDate) === 'Today' || getDateLabel(activeDate) === 'Yesterday' 
                  ? getDateLabel(activeDate) 
                  : formatDate(activeDate)}</h2>
            <span className="text-[0.8rem] md:text-[0.9rem] text-customText-secondary bg-white/5 px-3 py-1 rounded-full font-medium">
              {completedCount} / {activeTodos.length} completed
            </span>
          </div>

          <form className="flex gap-3 mb-6" onSubmit={handleAddTodo}>
            <input
              type="text"
              placeholder="What do you need to do?"
              className="flex-1 px-4 py-3 bg-black/20 border border-border rounded-md text-customText-primary text-[1rem] transition-colors duration-200 focus:outline-none focus:border-accent-primary"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="btn btn-primary" disabled={!newTask.trim() || loading}>
              Add
            </button>
          </form>

          <div className="flex flex-col gap-3">
            {activeTodos.length === 0 ? (
              <div className="text-center py-10 text-customText-muted">
                <ClipboardList size={48} className="mx-auto mb-4 opacity-50" />
                <p>No tasks for this day. Enjoy your free time!</p>
              </div>
            ) : (
              activeTodos.map((todo) => (
                <div className={`group flex items-center p-4 bg-black/15 border border-transparent rounded-md transition-all duration-200 hover:bg-white/5 hover:border-border ${todo.completed ? 'opacity-60' : ''}`} key={todo._id}>
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded-[4px] border border-border bg-input checked:bg-accent-primary checked:border-accent-primary cursor-pointer transition-all duration-200 outline-none appearance-none relative checked:after:content-['✓'] checked:after:absolute checked:after:text-white checked:after:text-[14px] checked:after:font-bold checked:after:left-[4px] checked:after:top-[0px]"
                      checked={todo.completed}
                      onChange={() => handleToggle(todo)}
                    />
                  </label>
                  <span className={`flex-1 text-[1rem] ml-3 transition-all duration-200 ${todo.completed ? 'line-through text-customText-muted' : ''}`}>{todo.text}</span>
                  <button className="bg-transparent border-none text-customText-muted cursor-pointer p-2 rounded-sm opacity-0 transition-all duration-200 group-hover:opacity-100 hover:!text-danger hover:bg-[#e74c3c]/10" onClick={() => handleDelete(todo._id)} title="Delete task">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
