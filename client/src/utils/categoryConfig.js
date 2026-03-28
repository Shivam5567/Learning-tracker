/**
 * Category-type feature configuration.
 * Each category type enables only the fields relevant to its use case.
 */
export const CATEGORY_FEATURES = {
  dsa: {
    difficulty: true,
    revision: true,
    url: true,
    notes: true,
    readingStatus: false,
    pagesRead: false,
    priority: false,
    projectStatus: false,
  },
  books: {
    difficulty: false,
    revision: false,
    url: false,
    notes: true,
    readingStatus: true,
    pagesRead: true,
    priority: false,
    projectStatus: false,
  },
  theory: {
    difficulty: false,
    revision: true,
    url: true,
    notes: true,
    readingStatus: false,
    pagesRead: false,
    priority: false,
    projectStatus: false,
  },
  practical: {
    difficulty: false,
    revision: false,
    url: true,
    notes: true,
    readingStatus: false,
    pagesRead: false,
    priority: true,
    projectStatus: true,
  },
  custom: {
    difficulty: false,
    revision: true,
    url: true,
    notes: true,
    readingStatus: false,
    pagesRead: false,
    priority: false,
    projectStatus: false,
  },
};

/**
 * Detect category type from name (fallback for legacy categories without a type field).
 */
const NAME_TYPE_MAP = {
  'dsa': 'dsa',
  'books': 'books',
  'theory subjects': 'theory',
  'theory': 'theory',
  'practical': 'practical',
};

export function detectType(category) {
  if (category.type && category.type !== 'custom') return category.type;
  const nameLower = (category.name || '').toLowerCase().trim();
  return NAME_TYPE_MAP[nameLower] || 'custom';
}

/**
 * Get features for a category. Accepts the full category object for name-based fallback.
 */
export function getFeatures(category) {
  if (!category) return CATEGORY_FEATURES.custom;
  const type = detectType(category);
  return CATEGORY_FEATURES[type] || CATEGORY_FEATURES.custom;
}

