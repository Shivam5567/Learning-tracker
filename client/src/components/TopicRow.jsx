import RevisionBadge from './RevisionBadge';

export default function TopicRow({ topic, onToggleComplete, onDelete, onEdit, features = {} }) {
  return (
    <div className="topic-row" onClick={() => onEdit(topic)}>
      <span className="topic-chevron">›</span>

      <div
        className={`topic-checkbox ${topic.completed ? 'checked' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete(topic);
        }}
      >
        {topic.completed && '✓'}
      </div>

      <span className={`topic-name ${topic.completed ? 'completed' : ''}`}>
        {/* DSA: Difficulty badge */}
        {features.difficulty && topic.difficulty && (
          <span className={`difficulty-badge difficulty-${topic.difficulty.toLowerCase()}`}>
            {topic.difficulty}
          </span>
        )}
        {/* Books: Reading status badge */}
        {features.readingStatus && topic.readingStatus && (
          <span className={`reading-badge reading-${topic.readingStatus.toLowerCase().replace(' ', '-')}`}>
            {topic.readingStatus}
          </span>
        )}
        {/* Practical: Priority badge */}
        {features.priority && topic.priority && (
          <span className={`priority-badge priority-${topic.priority.toLowerCase()}`}>
            {topic.priority}
          </span>
        )}
        {/* Practical: Project status badge */}
        {features.projectStatus && topic.projectStatus && (
          <span className={`project-badge project-${topic.projectStatus.toLowerCase().replace(' ', '-')}`}>
            {topic.projectStatus}
          </span>
        )}

        {topic.url ? (
          <a href={topic.url.startsWith('http') ? topic.url : `https://${topic.url}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: 'inherit', textDecoration: 'none' }}>
            {topic.name} <span style={{ fontSize: '0.85em', marginLeft: '6px', opacity: 0.8 }} title="Open link">🔗</span>
          </a>
        ) : (
          topic.name
        )}
        {/* Books: Pages progress */}
        {features.pagesRead && topic.totalPages > 0 && (
          <span style={{ marginLeft: '8px', fontSize: '0.8em', color: 'var(--text-muted)', fontWeight: 500 }}>
            {topic.pagesRead}/{topic.totalPages}p
          </span>
        )}
        {topic.notes && (
          <span title={topic.notes} style={{ marginLeft: '8px', cursor: 'help', opacity: 0.9 }}>📝</span>
        )}
      </span>

      {topic.completed && topic.nextReview && (
        <RevisionBadge nextReview={topic.nextReview} />
      )}

      <div style={{ display: 'flex', gap: '4px' }}>
        <button
          className="topic-delete"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(topic);
          }}
          title="Edit topic"
        >
          ✏️
        </button>
        <button
          className="topic-delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(topic);
          }}
          title="Delete topic"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
