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
  const [isMinimized, setIsMinimized] = useState(false);
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
        className={`pomodoro-minimized slide-up ${isDragging ? 'dragging' : ''}`}
        onClick={() => !hasMoved.current && setIsMinimized(false)}
        onMouseDown={handleMouseDown}
        style={{ 
          borderColor: mode.color,
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease'
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={mode.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span className="pomo-mini-time" style={{ color: mode.color }}>
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
      className={`pomodoro-widget slide-up ${isDragging ? 'dragging' : ''}`}
      onMouseDown={handleMouseDown}
      style={{ 
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: isDragging ? 'none' : 'transform 0.2s ease'
      }}
    >
      <div className="pomo-header">
        <div className="pomo-tabs">
          {Object.values(MODES).map((m) => (
            <button
              key={m.name}
              className={`pomo-tab ${mode.name === m.name ? 'active' : ''}`}
              onClick={() => switchMode(m)}
            >
              {m.name}
            </button>
          ))}
        </div>
        <button className="pomo-minimize-btn" onClick={() => setIsMinimized(true)} title="Minimize">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 14 10 14 10 20"></polyline>
            <polyline points="20 10 14 10 14 4"></polyline>
            <line x1="14" y1="10" x2="21" y2="3"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
        </button>
      </div>

      <div className="pomo-body">
        <div className="pomo-circle-container">
          <svg className="pomo-circle-svg" width="100" height="100">
            <circle
              className="pomo-circle-bg"
              cx="50" cy="50" r={radius}
            />
            <circle
              className="pomo-circle-progress"
              cx="50" cy="50" r={radius}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: offset,
                stroke: mode.color
              }}
            />
          </svg>
          <div className="pomo-time-display">
            {mode.name === 'Custom' && !isRunning ? (
              <div className="pomo-custom-input-wrapper">
                <input
                  type="number"
                  min="1"
                  max="999"
                  className="pomo-custom-input"
                  value={customMinutes || ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    setCustomMinutes(val);
                    setTimeLeft(val * 60);
                  }}
                  autoFocus
                />
                <span className="pomo-custom-label">m</span>
              </div>
            ) : (
              formatTime(timeLeft)
            )}
          </div>
        </div>

        <div className="pomo-controls">
          <button className={`pomo-btn ${isRunning ? 'pause' : 'play'}`} onClick={toggleTimer}>
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
          
          <button className="pomo-btn reset" onClick={resetTimer} title="Reset">
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
