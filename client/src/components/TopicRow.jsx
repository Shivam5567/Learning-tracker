import RevisionBadge from './RevisionBadge';
import { Trophy, LinkIcon, Edit3, ClipboardList } from './Icons';

export default function TopicRow({ topic, onToggleComplete, onDelete, onEdit, onShowNotes, features = {} }) {
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

      <span className={`topic-name ${topic.completed ? 'completed' : ''} ${topic.isMastered ? 'mastered' : ''}`}>
        {/* Mastery Trophy */}
        {topic.isMastered && (
          <span className="mastery-trophy" title="Mastered! (365+ day interval)">
            <Trophy size={14} style={{ color: 'var(--warning)' }} />
          </span>
        )}

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
            {topic.name} <LinkIcon size={12} style={{ marginLeft: '6px', opacity: 0.8 }} title="Open link" />
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
          <button 
            className="topic-notes-btn"
            onClick={(e) => {
              e.stopPropagation();
              onShowNotes(topic);
            }}
            title="View notes"
          >
            <ClipboardList size={14} />
          </button>
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
          <Edit3 size={16} />
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
