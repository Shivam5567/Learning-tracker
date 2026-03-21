import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">LT</div>
      <nav className="sidebar-nav">
        <NavLink
          to="/"
          className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
          title="Dashboard"
        >
          🏠
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
      <button className="sidebar-user" onClick={handleLogout} title="Logout">
        👤
      </button>
    </aside>
  );
}
