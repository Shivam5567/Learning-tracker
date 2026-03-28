import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Search, BarChart3, CheckSquare, Sun, Moon, BookOpen, Command, LogOut } from './Icons';

export default function Sidebar({ onSearchOpen, onReadmeOpen }) {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">LT</div>
      <nav className="sidebar-nav">
        <button
          className="sidebar-nav-item"
          onClick={onSearchOpen}
          title="Search (Ctrl+K)"
        >
          <Search />
        </button>

        <NavLink
          to="/dashboard"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          title="Dashboard"
        >
          <BarChart3 />
        </NavLink>
        <NavLink
          to="/todo"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          title="To-Do List"
        >
          <CheckSquare />
        </NavLink>
      </nav>
      <div className="sidebar-spacer" />
      <button
        className="sidebar-nav-item"
        onClick={toggleTheme}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? <Sun /> : <Moon />}
      </button>
      <button 
        className="sidebar-nav-item" 
        onClick={onReadmeOpen}
        title="Study Guide (Shift+R)"
      >
        <BookOpen />
      </button>
      <button className="sidebar-nav-item" style={{ color: 'var(--text-muted)' }}
        onClick={() => { const e = new KeyboardEvent('keydown', { key: '?', bubbles: true }); window.dispatchEvent(e); }}
        title="Keyboard shortcuts (?)">
        <Command size={18} />
      </button>
      <button className="sidebar-user" onClick={handleLogout} title="Logout">
        <LogOut />
      </button>
    </aside>
  );
}

