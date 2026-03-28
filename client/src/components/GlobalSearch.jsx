import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories } from '../api';

export default function GlobalSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setLoading(true);
      getCategories()
        .then(res => setAllCategories(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const found = [];
    allCategories.forEach(cat => {
      (cat.sections || []).forEach(section => {
        (section.topics || []).forEach(topic => {
          if (
            topic.name.toLowerCase().includes(q) ||
            (topic.notes || '').toLowerCase().includes(q)
          ) {
            found.push({
              topicId: topic._id,
              topicName: topic.name,
              topicCompleted: topic.completed,
              topicDifficulty: topic.difficulty,
              sectionName: section.name,
              categoryId: cat._id,
              categoryName: cat.name,
            });
          }
        });
      });
      // Also match category name itself
      if (cat.name.toLowerCase().includes(q)) {
        found.push({
          topicId: null,
          topicName: null,
          sectionName: null,
          categoryId: cat._id,
          categoryName: cat.name,
          isCategoryMatch: true,
        });
      }
    });
    setResults(found.slice(0, 12));
    setSelectedIndex(0);
  }, [query, allCategories]);

  const go = useCallback((result) => {
    navigate(`/category/${result.categoryId}`);
    onClose();
  }, [navigate, onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') setSelectedIndex(i => Math.min(i + 1, results.length - 1));
      if (e.key === 'ArrowUp') setSelectedIndex(i => Math.max(i - 1, 0));
      if (e.key === 'Enter' && results[selectedIndex]) go(results[selectedIndex]);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, results, selectedIndex, go, onClose]);

  if (!isOpen) return null;

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        <div className="search-input-row">
          <span className="search-icon">🔍</span>
          <input
            ref={inputRef}
            className="search-global-input"
            placeholder="Search topics, categories..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <kbd className="search-kbd">ESC</kbd>
        </div>

        {loading && (
          <div className="search-empty">Loading...</div>
        )}

        {!loading && query && results.length === 0 && (
          <div className="search-empty">No results for "{query}"</div>
        )}

        {!loading && results.length > 0 && (
          <ul className="search-results">
            {results.map((r, i) => (
              <li
                key={`${r.categoryId}-${r.topicId}-${i}`}
                className={`search-result-item ${i === selectedIndex ? 'selected' : ''}`}
                onClick={() => go(r)}
                onMouseEnter={() => setSelectedIndex(i)}
              >
                {r.isCategoryMatch ? (
                  <>
                    <span className="search-result-icon">📂</span>
                    <div className="search-result-info">
                      <span className="search-result-title">{r.categoryName}</span>
                      <span className="search-result-sub">Category</span>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="search-result-icon">{r.topicCompleted ? '✅' : '⬜'}</span>
                    <div className="search-result-info">
                      <span className="search-result-title">
                        {r.topicDifficulty && (
                          <span className={`difficulty-badge difficulty-${r.topicDifficulty.toLowerCase()}`} style={{ marginRight: 6 }}>
                            {r.topicDifficulty}
                          </span>
                        )}
                        {r.topicName}
                      </span>
                      <span className="search-result-sub">{r.categoryName} › {r.sectionName}</span>
                    </div>
                  </>
                )}
                <span className="search-result-arrow">→</span>
              </li>
            ))}
          </ul>
        )}

        {!query && !loading && (
          <div className="search-hint">
            <div className="search-hint-row"><kbd>↑↓</kbd> Navigate</div>
            <div className="search-hint-row"><kbd>↵</kbd> Open</div>
            <div className="search-hint-row"><kbd>ESC</kbd> Close</div>
          </div>
        )}
      </div>
    </div>
  );
}
