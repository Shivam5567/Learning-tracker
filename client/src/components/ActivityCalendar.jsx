import { useState, useEffect } from 'react';
import { getActivity } from '../api';
import { formatDate } from '../utils/helpers';
import { Flame } from './Icons';

export default function ActivityCalendar() {
  const [activityMap, setActivityMap] = useState(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      const res = await getActivity();
      const map = new Map();
      // res.data is array of { date: 'YYYY-MM-DD', count: N }
      res.data.forEach(item => {
        map.set(item.date, item.count);
      });
      setActivityMap(map);
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate the last 365 days
  const days = [];
  const today = new Date();
  // We want the calendar to end on today.
  // Standard github calendar has 52 weeks * 7 days = 364 days + today = 365 days.
  for (let i = 364; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    
    // Format YYYY-MM-DD
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    // Determine the level based on count
    const count = activityMap.get(dateStr) || 0;
    let level = 0;
    if (count > 0 && count <= 2) level = 1;
    else if (count > 2 && count <= 4) level = 2;
    else if (count > 4 && count <= 6) level = 3;
    else if (count > 6) level = 4;

    days.push({
      dateStr,
      count,
      level,
      // User friendly date string
      displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });
  }

  // To make the grid line up correctly (Sun-Sat rows), we might need to pad the beginning 
  // with empty days so the first column matches the correct weekday.
  // Actually, grid-auto-flow: column aligns them automatically, but the top row is Sunday.
  const firstDayOfWeek = new Date(days[0].dateStr).getDay();
  const emptyPads = Array.from({ length: firstDayOfWeek }).map((_, i) => ({
    empty: true,
    key: `empty-${i}`
  }));

  const allCells = [...emptyPads, ...days];

  // Calculate current streak
  let currentStreak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) {
      currentStreak++;
    } else {
      // If today is 0, we check yesterday before breaking.
      if (i === days.length - 1) continue; 
      break;
    }
  }

  if (loading) {
    return (
      <div className="activity-card loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="activity-card slide-up">
      <div className="activity-header">
        <h2><Flame size={20} style={{marginRight: '8px', color: 'var(--accent-primary)', verticalAlign: 'text-bottom'}} /> Streak Tracker</h2>
        <span className="streak-count">{currentStreak} day streak</span>
      </div>
      
      <div className="activity-calendar-wrapper">
        <div className="activity-grid">
          {allCells.map((day, idx) => {
            if (day.empty) {
              return <div key={day.key} className="activity-cell empty" />;
            }

            return (
              <div
                key={day.dateStr}
                className={`activity-cell level-${day.level}`}
                title={`${day.count} contributions on ${day.displayDate}`}
              />
            );
          })}
        </div>
      </div>
      
      <div className="activity-legend">
        <span>Less</span>
        <div className="activity-cell level-0"></div>
        <div className="activity-cell level-1"></div>
        <div className="activity-cell level-2"></div>
        <div className="activity-cell level-3"></div>
        <div className="activity-cell level-4"></div>
        <span>More</span>
      </div>
    </div>
  );
}
