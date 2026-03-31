import { useState, useEffect, useRef } from 'react';
import ConfirmDialog from './ConfirmDialog';
import { useTheme } from '../context/ThemeContext';

const MODES = {
  POMODORO: { name: 'Pomodoro', minutes: 25, color: '#8e44ad' },
  SHORT_BREAK: { name: 'Short Break', minutes: 5, color: '#2ecc71' },
  LONG_BREAK: { name: 'Long Break', minutes: 15, color: '#3498db' },
  CUSTOM: { name: 'Custom', minutes: 45, color: '#9b59b6' },
};

const AMBIENT_SOUNDS = [
  { id: 'none', name: 'None', icon: '🔇' },
  {
    id: 'rain',
    name: 'Cozy Storm',
    icon: '⛈️',
    url: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg'
  },
  {
    id: 'forest',
    name: 'Mountain Stream',
    icon: '🌊',
    url: 'https://actions.google.com/sounds/v1/water/small_stream_flowing.ogg'
  },
  {
    id: 'piano',
    name: 'Deep Thunder',
    icon: '🌩️',
    url: 'https://actions.google.com/sounds/v1/weather/rolling_thunder.ogg'
  },
];

export default function PomodoroTimer() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [mode, setMode] = useState(MODES.POMODORO);
  const [customMinutes, setCustomMinutes] = useState(MODES.CUSTOM.minutes);
  const [timeLeft, setTimeLeft] = useState(MODES.POMODORO.minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isMinimized, setIsMinimized] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  const [isZenMode, setIsZenMode] = useState(false);
  const [activeSound, setActiveSound] = useState('none');
  const [volume, setVolume] = useState(0.5);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const dragStartPos = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  const timerRef = useRef(null);
  const audioRef = useRef(null);

  // --- FIXED PROGRESS MATH ---
  const currentTotalMins = mode.name === 'Custom' ? customMinutes : mode.minutes;
  const totalSeconds = currentTotalMins * 60;
  // Calculate remaining time as a fraction (1.0 down to 0.0)
  const timeFraction = totalSeconds > 0 ? timeLeft / totalSeconds : 0;

  // Math for Main Timer (Radius 40)
  const mainRadius = 40;
  const mainCircumference = 2 * Math.PI * mainRadius;
  const mainOffset = mainCircumference - (timeFraction * mainCircumference);

  // Math for Zen Timer (Radius 140)
  const zenRadius = 140;
  const zenCircumference = 2 * Math.PI * zenRadius;
  const zenOffset = zenCircumference - (timeFraction * zenCircumference);

  // Handle countdown
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      clearInterval(timerRef.current);
      setIsRunning(false);

      try {
        playBeep();
        if ('vibrate' in navigator) {
          navigator.vibrate([200, 100, 200]);
        }
        setShowCompleteModal(true);
      } catch (err) {
        console.error("Error in timer completion handler:", err);
      }
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, timeLeft, mode]);

  // Handle Ambient Audio
  useEffect(() => {
    if (activeSound !== 'none' && isRunning) {
      const soundData = AMBIENT_SOUNDS.find(s => s.id === activeSound);
      if (soundData?.url) {
        if (!audioRef.current) {
          audioRef.current = new Audio(soundData.url);
          audioRef.current.crossOrigin = 'anonymous';
          audioRef.current.loop = true;
        } else {
          audioRef.current.src = soundData.url;
        }
        audioRef.current.volume = volume;
        audioRef.current.play().catch(e => console.warn('Audio play failed:', e));
      }
    } else if (audioRef.current) {
      audioRef.current.pause();
    }

    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, [activeSound, isRunning, volume]);

  const playBeep = () => {
    try {
      const audio = new Audio("https://orangefreesounds.com/wp-content/uploads/2024/01/Beep-beep-notification-sound.mp3");
      audio.volume = 0.5;
      audio.play().catch(e => console.warn('Autoplay prevented:', e));
    } catch (e) {
      console.warn('Audio error:', e);
    }
  };

  const toggleTimer = () => {
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

    if (newMode.name === 'Pomodoro') setActiveSound('rain');
    else if (newMode.name === 'Short Break') setActiveSound('forest');
    else if (newMode.name === 'Long Break') setActiveSound('piano');
  };

  // Draggable logic
  const handleMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;
    setIsDragging(true);
    hasMoved.current = false;
    dragStartPos.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleTouchStart = (e) => {
    if (e.target.closest('button') || e.target.closest('input')) return;
    const touch = e.touches[0];
    setIsDragging(true);
    hasMoved.current = false;
    dragStartPos.current = { x: touch.clientX - position.x, y: touch.clientY - position.y };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      const newX = clientX - dragStartPos.current.x;
      const newY = clientY - dragStartPos.current.y;

      if (Math.abs(newX - position.x) > 3 || Math.abs(newY - position.y) > 3) hasMoved.current = true;
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.overflow = 'hidden';
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.overflow = '';
    };
  }, [isDragging, position]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Render Minimized
  if (isMinimized) {
    return (
      <div
        className={`fixed bottom-[72px] md:bottom-6 right-6 bg-glass backdrop-blur-md border-2 border-border rounded-full py-2 px-4 shadow-md z-[1000] flex items-center gap-2 cursor-grab transition-transform duration-150 hover:scale-105 active:cursor-grabbing text-customText-primary animate-[slideUp_0.3s_ease] ${isDragging ? '!cursor-grabbing' : ''}`}
        onClick={() => !hasMoved.current && setIsMinimized(false)}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
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

  // Render Main Widget
  return (
    <>
      <div
        className={`fixed bottom-[72px] md:bottom-6 right-6 w-[280px] bg-glass backdrop-blur-md border border-border rounded-2xl p-4 shadow-lg z-[1000] flex flex-col gap-4 select-none cursor-grab animate-[slideUp_0.3s_ease] ${isDragging ? '!cursor-grabbing' : ''}`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease'
        }}
      >
        {/* Header Navigation */}
        <div className="flex justify-between items-center">
          <div className="flex items-center bg-black/[0.05] dark:bg-white/[0.05] backdrop-blur-xl px-1 py-0.5 rounded-full border border-border gap-0.5 max-w-[182px]">
            {Object.values(MODES).map((m) => {
              const shortName = m.name === 'Pomodoro' ? 'Pomo' : m.name === 'Short Break' ? 'Short' : m.name === 'Long Break' ? 'Long' : 'Custom';
              return (
                <button
                  key={m.name}
                  className={`px-2 py-1.5 rounded-full text-[0.6rem] font-bold uppercase transition-all duration-300 ${mode.name === m.name ? 'bg-customText-primary text-secondary shadow-lg scale-105' : 'text-customText-secondary hover:text-customText-primary bg-transparent'}`}
                  onClick={() => switchMode(m)}
                >
                  {shortName}
                </button>
              );
            })}
          </div>
          <div className="flex gap-1">
            <button
              className={`btn-ghost rounded-full w-8 h-8 p-0 flex items-center justify-center transition-all ${isZenMode ? 'text-accent-primary' : 'text-customText-secondary hover:text-customText-primary'}`}
              onClick={() => setIsZenMode(true)}
              title="Focus Mode (Zen)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"></path><path d="M9 21H3v-6"></path><path d="M21 3l-7 7"></path><path d="M3 21l7-7"></path></svg>
            </button>
            <button className="btn-ghost rounded-full w-8 h-8 p-0 flex items-center justify-center text-customText-secondary hover:text-customText-primary transition-all" onClick={() => setIsMinimized(true)} title="Minimize">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
            </button>
          </div>
        </div>

        {/* --- MAIN TIMER SVG CIRCLE --- */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-[120px] h-[120px] flex items-center justify-center">
            <svg className="absolute top-0 left-0 -rotate-90 pointer-events-none" width="120" height="120" viewBox="0 0 120 120">
              <circle
                cx="60" cy="60" r={mainRadius}
                style={{ fill: 'none', stroke: isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.1)', strokeWidth: '6px' }}
              />
              <circle
                className={isRunning ? 'animate-breathe' : ''}
                cx="60" cy="60" r={mainRadius}
                style={{
                  fill: 'none',
                  stroke: mode.color,
                  strokeWidth: '8px',
                  strokeLinecap: 'round',
                  strokeDasharray: mainCircumference,
                  strokeDashoffset: mainOffset,
                  transition: 'stroke-dashoffset 1s linear',
                  filter: isRunning ? `drop-shadow(0 0 8px ${mode.color})` : 'none'
                }}
              />
            </svg>
            <div className="text-[1.8rem] font-bold tabular-nums z-[2] flex items-center justify-center text-customText-primary">
              {mode.name === 'Custom' && !isRunning ? (
                <div className="flex items-baseline gap-[2px]">
                  <input
                    type="number" min="1" max="999"
                    className="w-[48px] bg-transparent border-none border-b-2 border-customText-muted text-customText-primary text-[1.6rem] font-bold text-center p-0 outline-none transition-colors duration-150 focus:border-accent-primary [&::-webkit-inner-spin-button]:appearance-none cursor-pointer"
                    value={customMinutes || ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setCustomMinutes(val); setTimeLeft(val * 60);
                    }}
                    autoFocus
                  />
                  <span className="text-[1rem] text-customText-muted">m</span>
                </div>
              ) : formatTime(timeLeft)}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer transition-all duration-150 border-none ${isRunning ? 'bg-accent-primary text-white hover:bg-accent-secondary' : 'bg-input border border-border text-customText-primary hover:bg-border hover:scale-105'}`} onClick={toggleTimer}>
              {isRunning ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              )}
            </button>
            <button className="w-10 h-10 rounded-full bg-input border border-border text-customText-primary flex items-center justify-center cursor-pointer transition-all duration-150 hover:bg-border hover:scale-105" onClick={resetTimer} title="Reset">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
            </button>
          </div>
        </div>

        {/* Ambient Settings */}
        {isRunning && (
          <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-border/30">
            <div className="flex justify-between items-center px-1">
              <span className="text-[0.7rem] text-customText-muted font-medium uppercase tracking-wider">Ambient Sound</span>
              <div className="flex items-center gap-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                <input
                  type="range" min="0" max="1" step="0.05"
                  className="w-16 h-1 accent-accent-primary bg-progress-bg rounded-lg appearance-none cursor-pointer"
                  value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))}
                />
              </div>
            </div>
            <div className="flex gap-1 overflow-x-auto pb-1 hide-scrollbar">
              {AMBIENT_SOUNDS.map(s => (
                <button
                  key={s.id} onClick={() => setActiveSound(s.id)}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[0.7rem] whitespace-nowrap transition-all border ${activeSound === s.id ? 'bg-accent-primary/10 border-accent-primary text-accent-primary' : 'bg-transparent border-transparent text-customText-muted hover:bg-white/5'}`}
                >
                  <span>{s.icon}</span> {s.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* --- ZEN MODE OVERLAY --- */}
      {isZenMode && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[9999] flex flex-col items-center justify-center animate-[fadeIn_0.5s_ease] overflow-y-auto">
          <button
            className="absolute top-8 right-8 btn btn-secondary !rounded-full w-12 h-12 flex items-center justify-center p-0 transition-transform active:scale-90"
            onClick={() => setIsZenMode(false)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>

          <div className="flex flex-col items-center gap-10 max-w-[500px] w-full px-6 my-auto">
            <div className="text-center">
              <h2 className="text-[2.5rem] font-bold mb-2 tracking-tight text-white">{mode.name}</h2>
              <p className="text-white/60 text-[1.1rem]">Deep Work in Progress</p>
            </div>

            {/* ZEN TIMER SVG CIRCLE */}
            <div className="relative w-[340px] h-[340px] flex items-center justify-center">
              <svg className="absolute top-0 left-0 -rotate-90 pointer-events-none" width="340" height="340" viewBox="0 0 340 340">
                <circle
                  cx="170" cy="170" r={zenRadius}
                  style={{ fill: 'none', stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: '10px' }}
                />
                <circle
                  cx="170" cy="170" r={zenRadius}
                  style={{
                    fill: 'none',
                    stroke: mode.color,
                    strokeWidth: '12px',
                    strokeLinecap: 'round',
                    strokeDasharray: zenCircumference,
                    strokeDashoffset: zenOffset,
                    transition: 'stroke-dashoffset 1s linear',
                    filter: `drop-shadow(0 0 15px ${mode.color})`
                  }}
                />
              </svg>
              <div className="text-[4.5rem] font-extrabold tabular-nums text-white">
                {formatTime(timeLeft)}
              </div>
            </div>

            <div className="flex flex-col items-center gap-8 w-full">
              <div className="flex gap-6">
                <button
                  className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 border-none bg-white text-black hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                  onClick={toggleTimer}
                >
                  {isRunning ? (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                  ) : (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                  )}
                </button>
                <button
                  className="w-20 h-20 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center cursor-pointer transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
                  onClick={resetTimer}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                </button>
              </div>

              {/* Zen Ambient Controls */}
              <div className="bg-white/5 p-5 rounded-2xl w-full border border-white/10 backdrop-blur-md">
                <div className="flex justify-between items-center mb-5">
                  <span className="text-[0.85rem] font-bold text-white/50 uppercase tracking-[0.2em]">Focus Audio</span>
                  <div className="flex items-center gap-3">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeOpacity="0.5" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
                    <input
                      type="range" min="0" max="1" step="0.05"
                      className="w-20 h-1 accent-white bg-white/10 rounded-lg appearance-none cursor-pointer"
                      value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {AMBIENT_SOUNDS.map(s => (
                    <button
                      key={s.id} onClick={() => setActiveSound(s.id)}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[0.95rem] font-medium transition-all border ${activeSound === s.id ? 'bg-white text-black border-white shadow-glow-white' : 'bg-transparent border-white/10 text-white hover:bg-white/10'}`}
                    >
                      {s.icon} {s.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showCompleteModal}
        onClose={() => {
          setShowCompleteModal(false);
          resetTimer();
        }}
        onConfirm={() => {
          setShowCompleteModal(false);
          resetTimer();
        }}
        title={`${mode.name} Complete!`}
        message="Your session has finished. Time to switch gears!"
        confirmText="Great, let's go!"
        confirmVariant="primary"
        showCancel={false}
      />
    </>
  );
}