import { useState } from 'react';
import TopicRow from './TopicRow';

export default function SectionAccordion({ section, onToggleComplete, onDeleteTopic, onAddTopic }) {
  const [expanded, setExpanded] = useState(false);

  const completedCount = section.topics.filter(t => t.completed).length;
  const totalCount = section.topics.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="section-accordion">
      <div className="section-header" onClick={() => setExpanded(!expanded)}>
        <span className={`section-chevron ${expanded ? 'expanded' : ''}`}>›</span>
        <span className="section-name">{section.name}</span>
        <span className="section-count">
          <span>{completedCount}</span> / {totalCount}
        </span>
        <div className="section-progress-mini">
          <div
            className="section-progress-mini-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className={`section-body ${expanded ? 'expanded' : ''}`}>
        <div className="section-body-inner">
          {section.topics.map((topic) => (
            <TopicRow
              key={topic._id}
              topic={topic}
              onToggleComplete={onToggleComplete}
              onDelete={onDeleteTopic}
            />
          ))}

          <button
            className="btn btn-secondary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              onAddTopic(section._id);
            }}
            style={{ marginTop: '8px' }}
          >
            + Add Topic
          </button>
        </div>
      </div>
    </div>
  );
}
