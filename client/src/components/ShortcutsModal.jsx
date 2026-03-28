import React from 'react';
import { Globe, Library, ClipboardList } from './Icons';

const SHORTCUT_GROUPS = [
  {
    group: <><Globe size={16} style={{marginRight: '8px'}} /> Global</>,
    shortcuts: [
      { keys: ['Ctrl', 'K'], label: 'Open search' },
      { keys: ['?'], label: 'Show this help' },
      { keys: ['G', 'D'], label: 'Go to Dashboard' },
      { keys: ['G', 'T'], label: 'Go to Planner' },
      { keys: ['Esc'], label: 'Close modal / overlay' },
    ],
  },
  {
    group: <><Library size={16} style={{marginRight: '8px'}} /> Dashboard</>,
    shortcuts: [
      { keys: ['N'], label: 'New category' },
    ],
  },
  {
    group: <><ClipboardList size={16} style={{marginRight: '8px'}} /> Category Page</>,
    shortcuts: [
      { keys: ['N'], label: 'Add topic to last section' },
      { keys: ['S'], label: 'Add new section' },
      { keys: ['F'], label: 'Focus search bar' },
      { keys: ['1'], label: 'Filter: All Topics' },
      { keys: ['2'], label: 'Filter: Revision Due' },
    ],
  },
];

export default function ShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="shortcuts-modal" onClick={e => e.stopPropagation()}>
        <div className="shortcuts-header">
          <h2>Keyboard Shortcuts</h2>
          <span className="shortcuts-close" onClick={onClose}>✕</span>
        </div>
        <div className="shortcuts-body">
          {SHORTCUT_GROUPS.map(g => (
            <div key={g.group} className="shortcut-group">
              <div className="shortcut-group-title">{g.group}</div>
              {g.shortcuts.map(s => (
                <div key={s.label} className="shortcut-row">
                  <span className="shortcut-label">{s.label}</span>
                  <span className="shortcut-keys">
                    {s.keys.map((k, i) => (
                      <span key={i}>
                        <kbd>{k}</kbd>
                        {i < s.keys.length - 1 && <span className="shortcut-then"> then </span>}
                      </span>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="shortcuts-footer">
          Press <kbd>?</kbd> to toggle this panel
        </div>
      </div>
    </div>
  );
}
