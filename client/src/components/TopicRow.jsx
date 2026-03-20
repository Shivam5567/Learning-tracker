import RevisionBadge from './RevisionBadge';

export default function TopicRow({ topic, onToggleComplete, onDelete }) {
  const progressPercent = topic.totalItems > 0
    ? (topic.completedItems / topic.totalItems) * 100
    : 0;

  return (
    <div className="topic-row">
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
        {topic.name}
      </span>

      {topic.completed && topic.nextReview && (
        <RevisionBadge nextReview={topic.nextReview} />
      )}

      <div className="topic-progress">
        <div className="topic-progress-bar">
          <div
            className="topic-progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="topic-count">
          {topic.completedItems} / {topic.totalItems}
        </span>
      </div>

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
  );
}
