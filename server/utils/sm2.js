/**
 * SM-2 Spaced Repetition Algorithm
 * 
 * Quality ratings:
 *   5 - Perfect response
 *   4 - Correct, after some hesitation
 *   3 - Correct, but with significant difficulty
 *   2 - Incorrect, but answer seemed easy to recall (Second Chance)
 *   1 - Incorrect, but recognized upon seeing answer
 *   0 - Complete blackout
 */

/**
 * Calculates the next repetition interval and ease factor based on the SM-2 algorithm.
 * 
 * @param {Object} topic - Current topic state { easeFactor, interval, repetitions }
 * @param {number} quality - User-provided rating (0-5)
 * @returns {Object} Updated topic state and next review date
 */
function calculateSM2(topic, quality) {
  let { easeFactor = 2.5, interval = 0, repetitions = 0 } = topic;

  // Ensure quality is in valid range
  quality = Math.max(0, Math.min(5, Math.round(quality)));

  if (quality >= 3) {
    // ---- Successful Repetition ----
    if (repetitions === 0) {
      interval = 1; // 1st successful repetition: 1 day
    } else if (repetitions === 1) {
      // 2nd successful repetition: Dynamic Scaling based on quality
      if (quality === 5) interval = 6;
      else if (quality === 4) interval = 4;
      else if (quality === 3) interval = 2;
    } else {
      // 3rd+ successful repetition: Scale by Ease Factor
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else if (quality === 2) {
    // ---- Edge Case: Quality 2 (Second Chance) ----
    // Do not reset history completely. Give a quick second chance tomorrow.
    repetitions = 1; 
    interval = 1;
  } else {
    // ---- Failed Repetition (0 or 1) ----
    repetitions = 0;
    interval = 1;
  }

  // Update Ease Factor using standard SM-2 formula
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  // Safety Limits for Ease Factor
  if (easeFactor < 1.3) easeFactor = 1.3; // Minimum Floor to avoid "Ease Hell"
  if (easeFactor > 5.0) easeFactor = 5.0; // Maximum Cap

  // Mastery Threshold (1 Year)
  const isMastered = interval >= 365;

  // Calculate next review date (set to start of the day)
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);
  nextReview.setHours(0, 0, 0, 0);

  return {
    easeFactor: Math.round(easeFactor * 100) / 100,
    interval,
    repetitions,
    nextReview,
    isMastered,
    lastReviewed: new Date(),
  };
}

/**
 * Get a refined, human-readable label for when the next revision is due.
 * 
 * @param {Date|string} nextReview - The scheduled next review date
 * @returns {string|null}
 */
function getRevisionLabel(nextReview) {
  if (!nextReview) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const reviewDate = new Date(nextReview);
  const reviewDay = new Date(reviewDate.getFullYear(), reviewDate.getMonth(), reviewDate.getDate());
  
  const diffTime = reviewDay - today;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'Past Due';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays <= 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
  
  return `In ${Math.ceil(diffDays / 30)} months`;
}

module.exports = { calculateSM2, getRevisionLabel };
