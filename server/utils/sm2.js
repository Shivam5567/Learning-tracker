/**
 * SM-2 Spaced Repetition Algorithm
 * 
 * Quality ratings:
 *   0 - Complete blackout
 *   1 - Incorrect, but recognized upon seeing answer
 *   2 - Incorrect, but answer seemed easy to recall
 *   3 - Correct, but with significant difficulty
 *   4 - Correct, after some hesitation
 *   5 - Perfect response
 */

function calculateSM2(topic, quality) {
  let { easeFactor = 2.5, interval = 0, repetitions = 0 } = topic;

  // Ensure quality is in valid range
  quality = Math.max(0, Math.min(5, Math.round(quality)));

  if (quality >= 3) {
    // Correct response
    if (repetitions === 0) {
      interval = 1; // 1 day
    } else if (repetitions === 1) {
      interval = 6; // 6 days
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    // Incorrect response — reset
    repetitions = 0;
    interval = 1;
  }

  // Update ease factor
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Ease factor should not go below 1.3
  if (easeFactor < 1.3) {
    easeFactor = 1.3;
  }

  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    easeFactor: Math.round(easeFactor * 100) / 100,
    interval,
    repetitions,
    nextReview,
    lastReviewed: new Date(),
  };
}

/**
 * Get a human-readable label for when the next revision is due
 */
function getRevisionLabel(nextReview) {
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

module.exports = { calculateSM2, getRevisionLabel };
