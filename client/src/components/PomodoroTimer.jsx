import { useState, useEffect, useRef } from 'react';

const MODES = {
  POMODORO: { name: 'Pomodoro', minutes: 25, color: 'var(--accent-primary)' },
  SHORT_BREAK: { name: 'Short Break', minutes: 5, color: '#2ecc71' },
  LONG_BREAK: { name: 'Long Break', minutes: 15, color: '#3498db' },
  CUSTOM: { name: 'Custom', minutes: 45, color: '#9b59b6' },
};

const AMBIENT_SOUNDS = [
  { id: 'none', name: 'None', icon: '🔇' },
  { id: 'rain', name: 'Cozy Storm', icon: '⛈️', url: 'https://assets.mixkit.co/active_storage/sfx/2436/2436-preview.mp3' },
  { id: 'forest', name: 'Mountain Stream', icon: '🌊', url: 'https://assets.mixkit.co/active_storage/sfx/2429/2429-preview.mp3' },
  { id: 'piano', name: 'Healing Piano', icon: '🎹', url: 'https://cdn.pixabay.com/audio/2022/10/30/audio_245209f9f8.mp3' },
];

export default function PomodoroTimer() {
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
  const dragStartPos = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  const timerRef = useRef(null);
  const audioRef = useRef(null);

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
          audioRef.current.crossOrigin = 'anonymous';
        }
        audioRef.current.volume = volume;
        audioRef.current.play().catch(e => {
          console.error(`Audio play failed (${activeSound}):`, e.name, e.message);
          if (e.name === 'NotSupportedError') {
            console.warn('Browser does not support this audio format or source was not found.');
          }
        });
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [activeSound, isRunning, volume]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  const playBeep = () => {
    try {
      const audio = new Audio("../src/assets/mixkit-happy-bells-notification-937.wav"); // path to your file
      audio.volume = 0.5; // 0 to 1
      audio.play();
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

    // Smart-switch ambient sound based on mode
    if (newMode.name === 'Pomodoro') setActiveSound('rain');
    else if (newMode.name === 'Short Break') setActiveSound('forest');
    else if (newMode.name === 'Long Break') setActiveSound('piano');
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
    <>
      <div
        className={`fixed bottom-[72px] md:bottom-6 right-6 w-[280px] bg-glass backdrop-blur-md border border-border rounded-2xl p-4 shadow-lg z-[1000] flex flex-col gap-4 select-none cursor-grab animate-[slideUp_0.3s_ease] ${isDragging ? '!cursor-grabbing' : ''}`}
        onMouseDown={handleMouseDown}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.2s ease'
        }}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center bg-white/5 backdrop-blur-xl px-1 py-0.5 rounded-full border border-white/5 shadow-inner gap-0.5 max-w-[182px]">
            {Object.values(MODES).map((m) => {
              const shortName = m.name === 'Pomodoro' ? 'Pomo' :
                m.name === 'Short Break' ? 'Short' :
                  m.name === 'Long Break' ? 'Long' : 'Custom';
              return (
                <button
                  key={m.name}
                  className={`px-2 py-1.5 rounded-full text-[0.6rem] font-bold uppercase transition-all duration-300 ${mode.name === m.name ? 'bg-white text-black shadow-lg scale-105' : 'text-white/20 hover:text-white/50 bg-transparent'}`}
                  onClick={() => switchMode(m)}
                >
                  {shortName}
                </button>
              );
            })}
          </div>
          <div className="flex gap-1">
            <button
              className={`btn-ghost rounded-full w-8 h-8 p-0 flex items-center justify-center transition-all ${isZenMode ? 'text-accent-primary' : 'text-white/30 hover:text-white/80'}`}
              onClick={() => setIsZenMode(true)}
              title="Focus Mode (Zen)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"></path><path d="M9 21H3v-6"></path><path d="M21 3l-7 7"></path><path d="M3 21l7-7"></path></svg>
            </button>
            <button className="btn-ghost rounded-full w-8 h-8 p-0 flex items-center justify-center text-white/30 hover:text-white/80 transition-all" onClick={() => setIsMinimized(true)} title="Minimize">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="relative w-[100px] h-[100px] flex items-center justify-center">
            <svg className="absolute top-0 left-0 -rotate-90 pointer-events-none" width="100" height="100">
              <circle
                className="fill-none stroke-white/5 stroke-[4px]"
                cx="50" cy="50" r={radius}
              />
              <circle
                className={`fill-none stroke-[6px] transition-[stroke-dashoffset] duration-[1s] ease-linear stroke-linecap-round ${isRunning ? 'animate-breathe' : ''}`}
                cx="50" cy="50" r={radius}
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: offset,
                  stroke: mode.color,
                  filter: isRunning ? `drop-shadow(0 0 8px ${mode.color})` : 'none'
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
                  key={s.id}
                  onClick={() => setActiveSound(s.id)}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[0.7rem] whitespace-nowrap transition-all border ${activeSound === s.id ? 'bg-accent-primary/10 border-accent-primary text-accent-primary' : 'bg-transparent border-transparent text-customText-muted hover:bg-white/5'}`}
                >
                  <span>{s.icon}</span> {s.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Zen Mode Overlay */}
        {isZenMode && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[2000] flex flex-col items-center justify-center animate-[fadeIn_0.5s_ease]">
            <button
              className="absolute top-8 right-8 btn btn-secondary !rounded-full w-12 h-12 flex items-center justify-center p-0"
              onClick={() => setIsZenMode(false)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            <div className="flex flex-col items-center gap-12 max-w-[500px] w-full px-6">
              <div className="text-center">
                <h2 className="text-[2.5rem] font-bold mb-2 tracking-tight">{mode.name}</h2>
                <p className="text-customText-muted text-[1.1rem]">Deep Work in Progress</p>
              </div>

              <div className="relative w-[300px] h-[300px] flex items-center justify-center">
                <svg className="absolute top-0 left-0 -rotate-90" width="300" height="300">
                  <circle className="fill-none stroke-white/5 stroke-[8px]" cx="150" cy="150" r="140" />
                  <circle
                    className="fill-none stroke-[8px] transition-all duration-1000 ease-linear"
                    cx="150" cy="150" r="140"
                    style={{
                      strokeDasharray: 2 * Math.PI * 140,
                      strokeDashoffset: 2 * Math.PI * 140 - (progressPercent / 100) * (2 * Math.PI * 140),
                      stroke: mode.color,
                      filter: 'drop-shadow(0 0 12px ' + mode.color + '80)'
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
                    className={`w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 border-none bg-white text-black hover:scale-105 active:scale-95 shadow-glow-white`}
                    onClick={toggleTimer}
                  >
                    {isRunning ? (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                    ) : (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    )}
                  </button>
                  <button
                    className="w-20 h-20 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center cursor-pointer transition-all hover:bg-white/20 hover:scale-105"
                    onClick={resetTimer}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                  </button>
                </div>

                {isRunning && (
                  <div className="bg-white/5 p-4 rounded-2xl w-full border border-white/10">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[0.85rem] font-semibold text-white/70 uppercase tracking-widest">Focus Audio</span>
                      <input
                        type="range" min="0" max="1" step="0.05"
                        className="w-24 h-1 accent-white bg-white/10 rounded-lg appearance-none"
                        value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {AMBIENT_SOUNDS.map(s => (
                        <button
                          key={s.id}
                          onClick={() => setActiveSound(s.id)}
                          className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[0.95rem] transition-all border ${activeSound === s.id ? 'bg-white text-black border-white' : 'bg-transparent border-white/10 text-white hover:bg-white/10'}`}
                        >
                          {s.icon} {s.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Zen Mode Overlay - Moved outside to prevent transform issues */}
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

            <div className="relative w-[300px] h-[300px] flex items-center justify-center">
              <svg className="absolute top-0 left-0 -rotate-90" width="300" height="300">
                <circle className="fill-none stroke-white/5 stroke-[8px]" cx="150" cy="150" r="140" />
                <circle
                  className="fill-none stroke-[8px] transition-all duration-1000 ease-linear"
                  cx="150" cy="150" r="140"
                  style={{
                    strokeDasharray: 2 * Math.PI * 140,
                    strokeDashoffset: 2 * Math.PI * 140 - (progressPercent / 100) * (2 * Math.PI * 140),
                    stroke: mode.color,
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
                  className={`w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 border-none bg-white text-black hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.3)]`}
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
                      key={s.id}
                      onClick={() => setActiveSound(s.id)}
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
    </>
  );
}
