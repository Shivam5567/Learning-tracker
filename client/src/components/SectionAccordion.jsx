import { useState } from 'react';
import TopicRow from './TopicRow';

export default function SectionAccordion({
  section,
  onToggleComplete,
  onDeleteTopic,
  onAddTopic,
  onDeleteSection,
  onResetSection,
  onEditTopic,
  features = {}
}) {
  const [expanded, setExpanded] = useState(false);

  const completedCount = section.topics.filter(t => t.completed).length;
  const totalCount = section.topics.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="section-accordion">
      <div className="section-header" onClick={() => setExpanded(!expanded)}>
        <span className={`section-chevron ${expanded ? 'expanded' : ''}`}>›</span>
        <span className="section-name">{section.name}</span>

        {/* NEW: Grouped actions pushed to the right */}
        <div className="section-header-actions">
          <span className="section-count">
            <span>{completedCount}</span> / {totalCount}
          </span>

          <div className="section-progress-mini">
            <div
              className="section-progress-mini-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Sleek SVG Action Buttons */}
          <div className="tracker-action-group">
            {completedCount > 0 && (
              <button
                className="tracker-icon-btn btn-reset"
                onClick={(e) => {
                  e.stopPropagation(); // Prevents accordion from toggling
                  onResetSection(section._id);
                }}
                title="Reset all topics"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </button>
            )}
            <button
              className="tracker-icon-btn btn-delete"
              onClick={(e) => {
                e.stopPropagation(); // Prevents accordion from toggling
                onDeleteSection(section._id);
              }}
              title="Delete section"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className={`section-body ${expanded ? 'expanded' : ''}`}>
        <div className="section-body-inner">
          {section.topics.map((topic) => (
            <TopicRow
              key={topic._id}
              topic={topic}
              features={features}
              onToggleComplete={() => onToggleComplete(topic)}
              onDelete={() => onDeleteTopic(topic)}
              onEdit={() => onEditTopic(topic, section._id)}
            />
          ))}

          <button
            className="btn btn-secondary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              onAddTopic(section._id);
            }}
            style={{ marginTop: '12px', width: '100%', justifyContent: 'center', borderStyle: 'dashed' }}
          >
            + Add Topic
          </button>
        </div>
      </div>
    </div>
  );
}