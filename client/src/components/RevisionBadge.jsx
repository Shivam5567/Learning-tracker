import { getRevisionLabel } from '../utils/helpers';

export default function RevisionBadge({ nextReview }) {
  if (!nextReview) return null;

  const label = getRevisionLabel(nextReview);
  if (!label) return null;

  const now = new Date();
  const reviewDate = new Date(nextReview);
  const diffDays = Math.ceil((reviewDate - now) / (1000 * 60 * 60 * 24));

  let badgeClass = 'bg-[#9e9e9e]/10 text-customText-muted';
  if (diffDays <= 0) badgeClass = 'bg-[#e74c3c]/10 text-danger';
  else if (diffDays <= 3) badgeClass = 'bg-[#3498db]/10 text-info';

  return (
    <span className={`px-2.5 py-1 rounded-full text-[0.75rem] font-bold tracking-[0.5px] uppercase ${badgeClass}`}>
      🔄 {label}
    </span>
  );
}
