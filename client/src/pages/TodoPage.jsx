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
    <div className="todo-page fade-in">
      <div className="todo-header">
        <h1>Weekly To-Do Manager</h1>
        <p>Track your tasks up to 1 week in the past.</p>
      </div>

      <div className="todo-content">
        {/* Date Tabs */}
        <div className="todo-tabs">
          {dates.map((d) => (
            <button
              key={d}
              className={`todo-tab ${activeDate === d ? 'active' : ''}`}
              onClick={() => setActiveDate(d)}
            >
              <span className="tab-name">{getDateLabel(d)}</span>
              <span className="tab-date">{d.split('-').slice(1).join('/')}</span>
            </button>
          )).reverse()}
        </div>

        {/* Task List Section */}
        <div className="todo-list-card slide-up">
          <div className="todo-list-header">
            <h2>{getDateLabel(activeDate) === 'Today' || getDateLabel(activeDate) === 'Yesterday' 
                  ? getDateLabel(activeDate) 
                  : formatDate(activeDate)}</h2>
            <span className="todo-count">
              {completedCount} / {activeTodos.length} completed
            </span>
          </div>

          <form className="add-todo-form" onSubmit={handleAddTodo}>
            <input
              type="text"
              placeholder="What do you need to do?"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="btn btn-primary" disabled={!newTask.trim() || loading}>
              Add
            </button>
          </form>

          <div className="todo-items">
            {activeTodos.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 0', minHeight: 'auto' }}>
                <div className="empty-icon"><ClipboardList size={48} /></div>
                <p>No tasks for this day yet.</p>
              </div>
            ) : (
              activeTodos.map((todo) => (
                <div className={`todo-item ${todo.completed ? 'completed' : ''}`} key={todo._id}>
                  <label className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => handleToggle(todo)}
                    />
                    <span className="custom-checkbox"></span>
                  </label>
                  <span className="todo-text">{todo.text}</span>
                  <button className="delete-todo-btn" onClick={() => handleDelete(todo._id)} title="Delete task">
                    <Trash2 size={16} />
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
