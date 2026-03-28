import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) return <div className="spinner" style={{margin: 'auto'}}/>;

  const dateStr = time.getDate().toString();
  const monthStr = time.toLocaleString('default', { month: 'long' }).toUpperCase();
  const dayStr = time.toLocaleString('default', { weekday: 'long' }).toUpperCase().split('').join(' ');
  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="aesthetic-desktop fade-in">
      
      {/* Center Widget */}
      <div className="aesthetic-widget-container">
        <div className="aesthetic-date-stack">
          <div className="aesthetic-date-number">{dateStr}</div>
          <div className="aesthetic-date-month">{monthStr}</div>
          <div className="aesthetic-date-time">{timeStr}</div>
        </div>
        
        <div className="aesthetic-day">{dayStr}</div>
        
        <div className="aesthetic-greeting-box">
          <p>{getGreeting()}, <span style={{color: '#e6db74'}}>{user ? user.name.split(' ')[0] : 'Guest'}</span>.</p>
          <p>I hope you slept well.</p>
        </div>
      </div>

      {/* Bottom Dock */}
      <div className="aesthetic-dock-wrapper slide-up">
        <div className="aesthetic-dock">
          {/* App Icons */}
          <div className="dock-icon bg-blue" onClick={() => navigate('/dashboard')} title="Dashboard">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
          </div>
          <div className="dock-icon bg-red" onClick={() => navigate('/todo')} title="To-Do List">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </div>
          {user ? (
            <div className="dock-icon bg-gray" onClick={logout} title="Logout">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </div>
          ) : (
            <div className="dock-icon bg-green" onClick={() => navigate('/login')} title="Login">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
