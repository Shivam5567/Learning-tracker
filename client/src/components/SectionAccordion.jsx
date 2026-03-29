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
  onShowNotes,
  features = {}
}) {
  const [expanded, setExpanded] = useState(false);

  const completedCount = section.topics.filter(t => t.completed).length;
  const totalCount = section.topics.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="bg-card border border-border rounded-lg mb-3 overflow-hidden transition-colors duration-200 hover:border-border-hover group">
      <div className="flex items-center p-4 md:px-5 cursor-pointer select-none transition-colors duration-200 hover:bg-white/5" onClick={() => setExpanded(!expanded)}>
        <span className={`w-6 h-6 flex flex-shrink-0 items-center justify-center mr-3 text-customText-muted transition-transform duration-200 text-[16px] font-bold ${expanded ? 'rotate-90' : ''}`}>›</span>
        <span className="font-semibold text-customText-primary text-[1rem]">{section.name}</span>

        {/* NEW: Grouped actions pushed to the right */}
        <div className="ml-auto flex items-center gap-4">
          <span className="text-[0.85rem] text-customText-muted font-medium">
            <span className="text-customText-primary font-bold">{completedCount}</span> / {totalCount}
          </span>

          <div className="w-[60px] h-1.5 rounded-full bg-black/20 overflow-hidden">
            <div
              className="h-full bg-accent-gradient rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Sleek SVG Action Buttons */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {completedCount > 0 && (
              <button
                className="w-8 h-8 rounded-md bg-transparent text-customText-muted flex items-center justify-center cursor-pointer transition-all duration-200 border-none hover:bg-white/10 hover:text-warning"
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
              className="w-8 h-8 rounded-md bg-transparent text-customText-muted flex items-center justify-center cursor-pointer transition-all duration-200 border-none hover:bg-white/10 hover:text-danger"
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

      <div className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${expanded ? 'max-h-[5000px]' : 'max-h-0'}`}>
        <div className="px-5 pb-4 pt-1 border-t border-border">
          <div className="flex flex-col gap-1 mt-2">
            {section.topics.map((topic) => (
              <TopicRow
                key={topic._id}
                topic={topic}
                features={features}
                onToggleComplete={() => onToggleComplete(topic)}
                onDelete={() => onDeleteTopic(topic)}
                onEdit={() => onEditTopic(topic, section._id)}
                onShowNotes={() => onShowNotes(topic)}
              />
            ))}
          </div>

          <button
            className="btn btn-secondary w-full justify-center border-dashed mt-3"
            onClick={(e) => {
              e.stopPropagation();
              onAddTopic(section._id);
            }}
          >
            + Add Topic
          </button>
        </div>
      </div>
    </div>
  );
}