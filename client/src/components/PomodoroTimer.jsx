import { useState, useEffect, useRef } from 'react';

const MODES = {
  POMODORO: { name: 'Pomodoro', minutes: 25, color: 'var(--accent-primary)' },
  SHORT_BREAK: { name: 'Short Break', minutes: 5, color: '#2ecc71' },
  LONG_BREAK: { name: 'Long Break', minutes: 15, color: '#3498db' },
  CUSTOM: { name: 'Custom', minutes: 45, color: '#9b59b6' },
};

export default function PomodoroTimer() {
  const [mode, setMode] = useState(MODES.POMODORO);
  const [customMinutes, setCustomMinutes] = useState(MODES.CUSTOM.minutes);
  const [timeLeft, setTimeLeft] = useState(MODES.POMODORO.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isMinimized, setIsMinimized] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);
  
  const timerRef = useRef(null);

  // Handle countdown
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      clearInterval(timerRef.current);
      setIsRunning(false);
      
      // Play a simple beep sound using Web Audio API
      playBeep();
      
      // Browser notification
      if (Notification.permission === 'granted') {
        new Notification(`${mode.name} Complete!`, {
          body: 'Time to switch gears.',
          icon: '/favicon.ico' // fallback
        });
      }
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft, mode]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); // 800Hz
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); // volume
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5); // beep for 0.5s
    } catch (e) {
      console.log('Audio not supported', e);
    }
  };

  const toggleTimer = () => {
    // Prevent starting custom timer if 0
    if (mode.name === 'Custom' && customMinutes <= 0) return;
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    const mins = mode.name === 'Custom' ? customMinutes : mode.minutes;
    setTimeLeft(mins * 60);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setIsRunning(false);
    const mins = newMode.name === 'Custom' ? customMinutes : newMode.minutes;
    setTimeLeft(mins * 60);
  };

  // Draggable logic
  const handleMouseDown = (e) => {
    // Only allow dragging if NOT clicking on interactive elements
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select') || e.target.closest('textarea')) return;
    
    setIsDragging(true);
    hasMoved.current = false;
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;

      const newX = e.clientX - dragStartPos.current.x;
      const newY = e.clientY - dragStartPos.current.y;

      // Threshold to detect movement (e.g., 3 pixels)
      if (Math.abs(newX - position.x) > 3 || Math.abs(newY - position.y) > 3) {
        hasMoved.current = true;
      }
      
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      // Prevent text selection while dragging
      document.body.style.userSelect = 'none';
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, position]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage for the circular ring
  const currentTotalMins = mode.name === 'Custom' ? customMinutes : mode.minutes;
  const totalSeconds = currentTotalMins * 60;
  // Prevent division by zero if custom time is 0
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - timeLeft) / totalSeconds) * 100 : 0;

  if (isMinimized) {
    return (
      <div 
        className={`fixed bottom-[72px] md:bottom-6 right-6 bg-glass backdrop-blur-md border-2 border-border rounded-full py-2 px-4 shadow-md z-[1000] flex items-center gap-2 cursor-grab transition-transform duration-150 hover:scale-105 active:cursor-grabbing text-customText-primary animate-[slideUp_0.3s_ease] ${isDragging ? '!cursor-grabbing' : ''}`}
        onClick={() => !hasMoved.current && setIsMinimized(false)}
        onMouseDown={handleMouseDown}
        style={{ 
          borderColor: mode.color,
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease'
        }}
      >
        <svg className="cursor-pointer" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={mode.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span className="font-bold tabular-nums text-[0.95rem]" style={{ color: mode.color }}>
          {formatTime(timeLeft)}
        </span>
      </div>
    );
  }

  // Circular progress math (radius 40, circumference ~251.2)
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progressPercent / 100) * circumference;

  return (
    <div 
      className={`fixed bottom-[72px] md:bottom-6 right-6 w-[280px] bg-glass backdrop-blur-md border border-border rounded-2xl p-4 shadow-lg z-[1000] flex flex-col gap-4 select-none cursor-grab animate-[slideUp_0.3s_ease] ${isDragging ? '!cursor-grabbing' : ''}`}
      onMouseDown={handleMouseDown}
      style={{ 
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: isDragging ? 'none' : 'transform 0.2s ease'
      }}
    >
      <div className="flex justify-between items-center">
        <div className="flex gap-1 bg-progress-bg p-1 rounded-sm">
          {Object.values(MODES).map((m) => (
            <button
              key={m.name}
              className={`flex-1 bg-transparent border-none text-customText-muted text-[0.75rem] px-2 py-1 rounded-sm cursor-pointer transition-all duration-150 hover:text-customText-primary ${mode.name === m.name ? '!bg-card !text-customText-primary font-medium shadow-sm' : ''}`}
              onClick={() => switchMode(m)}
            >
              {m.name}
            </button>
          ))}
        </div>
        <button className="bg-transparent border-none text-customText-muted cursor-pointer p-1 flex items-center justify-center transition-colors duration-150 hover:text-customText-primary" onClick={() => setIsMinimized(true)} title="Minimize">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 14 10 14 10 20"></polyline>
            <polyline points="20 10 14 10 14 4"></polyline>
            <line x1="14" y1="10" x2="21" y2="3"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
        </button>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="relative w-[100px] h-[100px] flex items-center justify-center">
          <svg className="absolute top-0 left-0 -rotate-90 pointer-events-none" width="100" height="100">
            <circle
              className="fill-none stroke-border stroke-[6px]"
              cx="50" cy="50" r={radius}
            />
            <circle
              className="fill-none stroke-[6px] transition-[stroke-dashoffset] duration-[1s] ease-linear transition-colors duration-300 stroke-linecap-round"
              cx="50" cy="50" r={radius}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: offset,
                stroke: mode.color
              }}
            />
          </svg>
          <div className="text-[1.8rem] font-bold tabular-nums z-[2] flex items-center justify-center text-customText-primary">
            {mode.name === 'Custom' && !isRunning ? (
              <div className="flex items-baseline gap-[2px]">
                <input
                  type="number"
                  min="1"
                  max="999"
                  className="w-[48px] bg-transparent border-none border-b-2 border-customText-muted text-customText-primary text-[1.6rem] font-bold text-center p-0 outline-none transition-colors duration-150 focus:border-accent-primary [&::-webkit-inner-spin-button]:appearance-none cursor-pointer"
                  value={customMinutes || ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setCustomMinutes(val);
                    setTimeLeft(val * 60);
                  }}
                  autoFocus
                />
                <span className="text-[1rem] text-customText-muted">m</span>
              </div>
            ) : (
              formatTime(timeLeft)
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-150 border-none ${isRunning ? 'bg-accent-primary text-white hover:bg-accent-secondary' : 'bg-input border border-border text-customText-primary hover:bg-border hover:scale-105'}`} onClick={toggleTimer}>
            {isRunning ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            )}
          </button>
          
          <button className="w-10 h-10 rounded-full bg-input border border-border text-customText-primary flex items-center justify-center cursor-pointer transition-all duration-150 hover:bg-border hover:scale-105" onClick={resetTimer} title="Reset">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
              <path d="M3 3v5h5"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
