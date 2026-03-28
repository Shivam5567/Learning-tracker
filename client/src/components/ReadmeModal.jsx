import React from 'react';

const README_CONTENT = {
  routine: [
    {
      title: '1. Compress (Morning – 2 hours)',
      details: [
        'Pick one topic (e.g., CFG transformations or MOD counters).',
        'Apply the 80/20 rule: identify the 20% of concepts that unlock most of the understanding.',
        'Create chunked notes: diagrams for electronics, flowcharts for theory, and mind maps for polity.',
        'Relate new ideas to what you already know (e.g., link ambiguity in CFGs to real-world language examples).',
      ],
    },
    {
      title: '2. Compile (Midday – 2 × 90-min focus blocks)',
      details: [
        'Block 1 (Theory practice): Work through problems slowly (“slow burn” mode). Test yourself with small exercises.',
        'Break (20 min): short walk or stretch.',
        'Block 2 (Application practice): Build or simulate circuits. Use agile testing: design → test → refine.',
        'End by teaching: explain the concept aloud or write a summary as if teaching a peer.',
      ],
    },
    {
      title: '3. Consolidate (Evening – 1 hour + rest)',
      details: [
        'Micro-rests: after each intense problem, pause for 10 seconds to let your brain replay.',
        'Macro-rest: try NSDR or Yoga Nidra for 20 minutes.',
        'Sleep: aim for 7–8 hours; this is when your brain reorganizes and stores knowledge.',
      ],
    },
  ],
  anchors: [
    'Treat friction as proof of growth.',
    'Compete only with yesterday’s version of yourself.',
    'Remember: speed of learning is your edge.',
  ],
  system: [
    { label: 'SM-2 Algorithm', text: 'Quality 5 (Perfect) = 6d, 4 (Good) = 4d, 3 (Hard) = 2d. Repetitions build long-term memory.' },
    { label: 'Mastery 🏆', text: 'Any topic reaching a 365-day interval is automatically marked as Mastered.' },
  ]
};

export default function ReadmeModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="shortcuts-modal readme-modal" onClick={e => e.stopPropagation()}>
        <div className="shortcuts-header">
          <h2>📖 Study Guide & System</h2>
          <span className="shortcuts-close" onClick={onClose}>✕</span>
        </div>
        <div className="shortcuts-body readme-body">
          <section className="readme-section">
            <h3 className="readme-title">🗓 Daily Study Routine</h3>
            {README_CONTENT.routine.map((item, i) => (
              <div key={i} className="routine-item">
                <h4>{item.title}</h4>
                <ul>
                  {item.details.map((d, j) => <li key={j}>{d}</li>)}
                </ul>
              </div>
            ))}
          </section>

          <section className="readme-section">
            <h3 className="readme-title">🧠 Mindset Anchors</h3>
            <ul className="anchors-list">
              {README_CONTENT.anchors.map((anchor, i) => (
                <li key={i}>{anchor}</li>
              ))}
            </ul>
          </section>

          <section className="readme-section">
            <h3 className="readme-title">🎯 System Guide</h3>
            <div className="system-grid">
              {README_CONTENT.system.map((item, i) => (
                <div key={i} className="system-item">
                  <strong>{item.label}</strong>: {item.text}
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="shortcuts-footer">
          "Speed of learning is your edge."
        </div>
      </div>
    </div>
  );
}
