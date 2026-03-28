import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

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
          🔍
        </button>

        <NavLink
          to="/dashboard"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          title="Dashboard"
        >
          📊
        </NavLink>
        <NavLink
          to="/todo"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          title="To-Do List"
        >
          ☑️
        </NavLink>
      </nav>
      <div className="sidebar-spacer" />
      <button
        className="sidebar-nav-item"
        onClick={toggleTheme}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        style={{ fontSize: '1.1rem' }}
      >
        {theme === 'dark' ? '🌞' : '🌙'}
      </button>
      <button 
        className="sidebar-nav-item" 
        onClick={onReadmeOpen}
        title="Study Guide (Shift+R)"
        style={{ fontSize: '1.1rem' }}
      >
        📖
      </button>
      <button className="sidebar-nav-item" style={{ fontSize: '1rem', color: 'var(--text-muted)' }}
        onClick={() => { const e = new KeyboardEvent('keydown', { key: '?', bubbles: true }); window.dispatchEvent(e); }}
        title="Keyboard shortcuts (?)">
        ⌨️
      </button>
      <button className="sidebar-user" onClick={handleLogout} title="Logout">
        👤
      </button>
    </aside>
  );
}

