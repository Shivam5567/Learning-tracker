import RevisionBadge from './RevisionBadge';
import { Trophy, LinkIcon, Edit3, ClipboardList } from './Icons';

export default function TopicRow({ topic, onToggleComplete, onDelete, onEdit, onShowNotes, features = {} }) {
  return (
    <div className="flex items-center px-4 py-3 rounded-md mb-1 transition-colors duration-200 cursor-pointer hover:bg-white/5 group relative" onClick={() => onEdit(topic)}>
      <span className="w-5 h-5 flex flex-shrink-0 items-center justify-center mr-3 text-customText-muted text-[12px] font-bold">›</span>

      <div
        className={`w-5 h-5 flex flex-shrink-0 rounded-[4px] border-2 border-customText-muted mr-3 items-center justify-center transition-all duration-200 ${topic.completed ? '!bg-success !border-success text-white text-[12px]' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete(topic);
        }}
      >
        {topic.completed && '✓'}
      </div>

      <span className={`flex-1 text-[0.95rem] text-customText-primary flex items-center flex-wrap gap-2 ${topic.completed ? 'text-customText-muted line-through' : ''} ${topic.isMastered ? 'mastered' : ''}`}>
        {/* Mastery Trophy */}
        {topic.isMastered && (
          <span className="mastery-trophy" title="Mastered! (365+ day interval)">
            <Trophy size={14} className="text-warning" />
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
          <a href={topic.url.startsWith('http') ? topic.url : `https://${topic.url}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="inline-flex items-center text-inherit no-underline hover:text-accent-primary">
            {topic.name} <LinkIcon size={12} className="ml-1.5 opacity-80" title="Open link" />
          </a>
        ) : (
          topic.name
        )}
        {/* Books: Pages progress */}
        {features.pagesRead && topic.totalPages > 0 && (
          <span className="ml-2 text-[0.8em] text-customText-muted font-medium">
            {topic.pagesRead}/{topic.totalPages}p
          </span>
        )}
        {topic.notes && (
          <button 
            className="bg-transparent border-none p-1 ml-2 text-customText-muted cursor-pointer rounded-sm inline-flex items-center transition-all duration-200 opacity-70 w-auto h-auto min-w-0 leading-none hover:bg-secondary hover:text-accent-primary hover:opacity-100"
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

      <div className="flex gap-1 ml-auto">
        <button
          className="w-7 h-7 flex items-center justify-center rounded-sm bg-transparent border-none text-customText-muted cursor-pointer opacity-100 md:opacity-0 transition-all duration-200 md:group-hover:opacity-100 hover:bg-white/10 hover:text-customText-primary"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(topic);
          }}
          title="Edit topic"
        >
          <Edit3 size={16} />
        </button>
        <button
          className="w-7 h-7 flex items-center justify-center rounded-sm bg-transparent border-none text-customText-muted cursor-pointer opacity-100 md:opacity-0 transition-all duration-200 md:group-hover:opacity-100 hover:bg-white/10 hover:text-danger font-bold text-lg"
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
