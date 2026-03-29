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
    <aside className="fixed md:top-0 bottom-0 left-0 w-full md:w-[72px] h-[60px] md:h-screen bg-sidebar border-t md:border-t-0 md:border-r border-border flex flex-row md:flex-col items-center justify-evenly md:justify-start px-2 md:px-0 py-0 md:py-5 z-[100]">
      <div className="hidden md:flex w-10 h-10 bg-accent-gradient rounded-md items-center justify-center font-extrabold text-[18px] text-white mb-8 shadow-glow">LT</div>
      
      <nav className="contents md:flex md:flex-col items-center md:gap-2 md:w-full md:px-3 justify-center">
        <button
          className="flex flex-col items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-md bg-transparent text-customText-muted transition-all duration-250 relative text-[20px] hover:bg-white/5 hover:text-customText-primary border-none cursor-pointer"
          onClick={onSearchOpen}
          title="Search (Ctrl+K)"
        >
          <Search size={22} />
        </button>

        <NavLink
          to="/dashboard"
          className={({ isActive }) => `flex flex-col items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-md transition-all duration-250 relative text-[20px] hover:bg-white/5 hover:text-customText-primary ${isActive ? 'bg-accent-primary/10 text-accent-primary font-semibold md:before:absolute md:before:-left-3 md:before:w-[3px] md:before:h-6 md:before:bg-accent-primary md:before:rounded-r-md before:absolute before:-top-1 before:w-6 before:h-[3px] before:bg-accent-primary before:hidden max-md:before:block before:rounded-b-md' : 'bg-transparent text-customText-muted'}`}
          title="Dashboard"
        >
          <BarChart3 size={22} />
        </NavLink>
        
        <NavLink
          to="/todo"
          className={({ isActive }) => `flex flex-col items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-md transition-all duration-250 relative text-[20px] hover:bg-white/5 hover:text-customText-primary ${isActive ? 'bg-accent-primary/10 text-accent-primary font-semibold md:before:absolute md:before:-left-3 md:before:w-[3px] md:before:h-6 md:before:bg-accent-primary md:before:rounded-r-md before:absolute before:-top-1 before:w-6 before:h-[3px] before:bg-accent-primary before:hidden max-md:before:block before:rounded-b-md' : 'bg-transparent text-customText-muted'}`}
          title="To-Do List"
        >
          <CheckSquare size={22} />
        </NavLink>
      </nav>

      <div className="hidden md:block flex-1" />
      
      <div className="contents md:flex md:flex-col items-center md:gap-0 justify-center">
        <button
          className="flex flex-col items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-md bg-transparent text-customText-muted transition-all duration-250 relative text-[20px] hover:bg-white/5 hover:text-customText-primary border-none cursor-pointer"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={22}/> : <Moon size={22}/>}
        </button>
        <button 
          className="hidden md:flex flex-col items-center justify-center w-12 h-12 rounded-md bg-transparent text-customText-muted transition-all duration-250 relative text-[20px] hover:bg-white/5 hover:text-customText-primary border-none cursor-pointer" 
          onClick={onReadmeOpen}
          title="Study Guide (Shift+R)"
        >
          <BookOpen />
        </button>
        <button className="hidden md:flex flex-col items-center justify-center w-12 h-12 rounded-md bg-transparent text-customText-muted transition-all duration-250 relative text-[20px] hover:bg-white/5 hover:text-customText-primary border-none cursor-pointer"
          onClick={() => { const e = new KeyboardEvent('keydown', { key: '?', bubbles: true }); window.dispatchEvent(e); }}
          title="Keyboard shortcuts (?)">
          <Command size={18} />
        </button>
        <button className="flex flex-col items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-md bg-transparent text-customText-muted transition-all duration-250 relative text-[20px] cursor-pointer hover:bg-[#e74c3c]/10 hover:text-danger border-none" onClick={handleLogout} title="Logout">
          <LogOut size={22} />
        </button>
      </div>
    </aside>
  );
}

