import React from 'react';
import { BarChart3, CheckCircle2 } from './Icons';

/**
 * DSA Stats Widget — shows Easy/Medium/Hard breakdown for DSA categories.
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
    { key: 'Easy', color: 'var(--success)', bg: 'rgba(46,204,113,0.15)' },
    { key: 'Medium', color: 'var(--warning)', bg: 'rgba(241,196,15,0.15)' },
    { key: 'Hard', color: 'var(--danger)', bg: 'rgba(231,76,60,0.15)' },
  ];

  const totalDone = Object.values(stats).reduce((s, v) => s + v.done, 0);
  const totalAll = Object.values(stats).reduce((s, v) => s + v.total, 0);

  return (
    <div className="bento-widget">
      <h3 style={{ marginBottom: '16px', fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>
        <BarChart3 size={18} style={{marginRight: '8px'}} /> Problem Breakdown
      </h3>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        {config.map(({ key, color, bg }) => (
          <div key={key} style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ background: bg, border: `1px solid ${color}30`, borderRadius: '8px', padding: '8px 4px' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color }}>{stats[key].done}</div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{key}</div>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>/ {stats[key].total}</div>
          </div>
        ))}
      </div>

      {config.map(({ key, color }) => {
        const pct = stats[key].total > 0 ? Math.round((stats[key].done / stats[key].total) * 100) : 0;
        return (
          <div key={key} style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{key}</span>
              <span style={{ color, fontWeight: 600 }}>{pct}%</span>
            </div>
            <div style={{ height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '99px', transition: 'width 0.6s ease' }} />
            </div>
          </div>
        );
      })}

      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-secondary)', alignItems: 'center' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center' }}><CheckCircle2 size={16} style={{marginRight: '8px'}} /> Total solved</span>
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{totalDone} / {totalAll}</span>
      </div>
    </div>
  );
}
