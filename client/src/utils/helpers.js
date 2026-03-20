export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function getRevisionLabel(nextReview) {
  if (!nextReview) return null;
  const now = new Date();
  const reviewDate = new Date(nextReview);
  const diffMs = reviewDate - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Due now!';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays <= 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
  return `In ${Math.ceil(diffDays / 30)} months`;
}

export function getProgressPercent(completedTopics, totalTopics) {
  if (totalTopics === 0) return 0;
  return Math.round((completedTopics / totalTopics) * 100);
}
