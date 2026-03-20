import { getRevisionLabel } from '../utils/helpers';

export default function RevisionBadge({ nextReview }) {
  if (!nextReview) return null;

  const label = getRevisionLabel(nextReview);
  if (!label) return null;

  const now = new Date();
  const reviewDate = new Date(nextReview);
  const diffDays = Math.ceil((reviewDate - now) / (1000 * 60 * 60 * 24));

  let badgeClass = 'later';
  if (diffDays <= 0) badgeClass = 'due';
  else if (diffDays <= 3) badgeClass = 'upcoming';

  return (
    <span className={`revision-badge ${badgeClass}`}>
      🔄 {label}
    </span>
  );
}
