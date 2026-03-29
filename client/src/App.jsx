import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import CategoryPage from './pages/CategoryPage';
import Auth from './pages/Auth';
import TodoPage from './pages/TodoPage';
import PomodoroTimer from './components/PomodoroTimer';
import GlobalSearch from './components/GlobalSearch';
import ShortcutsModal from './components/ShortcutsModal';
import ReadmeModal from './components/ReadmeModal';

function RootRoute() {
  const { loading } = useAuth();
  if (loading) return <div className="spinner-container"><div className="spinner" /></div>;
  return <Navigate to="/dashboard" />;
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [readmeOpen, setReadmeOpen] = useState(false);
  const gKeyPending = useRef(false);
  const gTimer = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      // Ignore when typing in inputs
      const tag = e.target.tagName;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) return;
      if (e.target.isContentEditable) return;

      const key = e.key.toLowerCase();

      // Ctrl+K → Search
      if ((e.ctrlKey || e.metaKey) && key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
        return;
      }

      // Esc → close any overlay
      if (key === 'escape') {
        setSearchOpen(false);
        setShortcutsOpen(false);
        setReadmeOpen(false);
        return;
      }

      // Shift+R or R → Readme (only Shift+R to avoid conflicts)
      if (key === 'r' && e.shiftKey) {
        e.preventDefault();
        setReadmeOpen(prev => !prev);
        return;
      }

      // ? → Shortcuts help
      if (key === '?') {
        e.preventDefault();
        setShortcutsOpen(prev => !prev);
        return;
      }

      // G+D → Dashboard, G+T → Todo (sequence shortcuts)
      if (key === 'g') {
        gKeyPending.current = true;
        clearTimeout(gTimer.current);
        gTimer.current = setTimeout(() => { gKeyPending.current = false; }, 1000);
        return;
      }
      if (gKeyPending.current) {
        gKeyPending.current = false;
        clearTimeout(gTimer.current);
        if (key === 'd') { e.preventDefault(); navigate('/dashboard'); }
        if (key === 't') { e.preventDefault(); navigate('/todo'); }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar 
        onSearchOpen={() => setSearchOpen(true)} 
        onReadmeOpen={() => setReadmeOpen(true)}
      />
      <main className="flex-1 ml-0 md:ml-[72px] pb-[80px] md:pb-8 px-4 md:px-10 pt-6 md:pt-8 min-h-screen">
        {children}
      </main>
      <PomodoroTimer />
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <ShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <ReadmeModal isOpen={readmeOpen} onClose={() => setReadmeOpen(false)} />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Auth />} />
              <Route path="/" element={<RootRoute />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/todo"
                element={
                  <ProtectedRoute>
                    <TodoPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/category/:id"
                element={
                  <ProtectedRoute>
                    <CategoryPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}


export default App;

