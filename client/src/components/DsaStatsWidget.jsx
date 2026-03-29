import React from 'react';
import { CheckCircle2 } from './Icons';

/**
 * DSA Stats Widget — shows Easy/Medium/Hard breakdown for DSA categories mirroring LeetCode.
 */
export default function DsaStatsWidget({ sections }) {
  const stats = { Easy: { done: 0, total: 0 }, Medium: { done: 0, total: 0 }, Hard: { done: 0, total: 0 } };

  (sections || []).forEach(section => {
    (section.topics || []).forEach(topic => {
      const d = topic.difficulty;
      if (stats[d]) {
        stats[d].total++;
        if (topic.completed) stats[d].done++;
      }
    });
  });

  const config = [
    { key: 'Easy', color: 'var(--success)', bg: 'rgba(46, 204, 113, 0.15)', borderRounding: 'rounded-l-[12px]' },
    { key: 'Medium', color: 'var(--warning)', bg: 'rgba(241, 196, 15, 0.15)', borderRounding: '' },
    { key: 'Hard', color: 'var(--danger)', bg: 'rgba(231, 76, 60, 0.15)', borderRounding: 'rounded-r-[12px]' },
  ];

  const totalDone = Object.values(stats).reduce((s, v) => s + v.done, 0);
  const totalAll = Object.values(stats).reduce((s, v) => s + v.total, 0);

  return (
    <div className="bg-card border border-border rounded-[16px] p-6 shadow-sm flex flex-col gap-6">
      
      {/* Top 3 Blocks */}
      <div>
        <div className="flex w-full">
          {config.map(({ key, color, bg, borderRounding }) => (
            <div 
              key={key} 
              className={`flex-1 flex flex-col items-center justify-center py-[22px] transition-transform duration-300 hover:scale-[1.02] ${borderRounding}`}
              style={{ backgroundColor: bg }}
            >
              <div className="text-[1.8rem] font-black leading-none mb-2" style={{ color }}>{stats[key].done}</div>
              <div className="text-[0.65rem] text-customText-secondary font-bold tracking-[1px] uppercase">{key}</div>
            </div>
          ))}
        </div>
        
        {/* The '/ X' labels below the blocks */}
        <div className="flex w-full mt-3">
          {config.map(({ key }) => (
            <div key={`${key}-total`} className="flex-1 text-center text-[0.85rem] text-customText-muted font-medium">
              / {stats[key].total}
            </div>
          ))}
        </div>
      </div>

      {/* Progress Bars */}
      <div className="flex flex-col gap-[18px]">
        {config.map(({ key, color }) => {
          const pct = stats[key].total > 0 ? Math.round((stats[key].done / stats[key].total) * 100) : 0;
          return (
            <div key={`${key}-bar`}>
              <div className="flex justify-between items-end mb-2">
                <span className="text-[0.9rem] text-customText-secondary">{key}</span>
                <span className="text-[0.85rem] font-bold" style={{ color }}>{pct}%</span>
              </div>
              <div className="h-[6px] w-full bg-border rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="pt-5 border-t border-border flex justify-between items-center">
        <div className="flex items-center text-customText-secondary font-medium text-[0.95rem] gap-[8px]">
          <CheckCircle2 size={18} />
          Total solved
        </div>
        <div className="font-extrabold text-[1.1rem] text-customText-primary tracking-tight">
          {totalDone} <span className="text-customText-muted mx-1 text-[0.95rem] font-semibold">/</span> {totalAll}
        </div>
      </div>
    </div>
  );
}
