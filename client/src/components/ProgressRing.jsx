export default function ProgressRing({ progress, size = 60, strokeWidth = 4, textSize = 'small' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  const textualSizes = {
    small: 'text-[0.85rem]',
    medium: 'text-[1.2rem]',
    large: 'text-[1.8rem]',
  };

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--progress-bg)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-[800ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e67e22" />
            <stop offset="100%" stopColor="#f39c12" />
          </linearGradient>
        </defs>
      </svg>
      <span className={`absolute font-bold text-customText-primary ${textualSizes[textSize]}`}>
        {progress}%
      </span>
    </div>
  );
}
