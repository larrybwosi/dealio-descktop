

// --- FUZZY SEARCH UTILITIES ---
export const normalizeString = (str: string): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Keep only alphanumeric characters and spaces
    .replace(/\s+/g, ' ')
    .trim();
};

export const calculateLevenshteinDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array(b.length + 1)
    .fill(null)
    .map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // Deletion
        matrix[j - 1][i] + 1, // Insertion
        matrix[j - 1][i - 1] + indicator // Substitution
      );
    }
  }
  return matrix[b.length][a.length];
};

export const getFuzzyMatchScore = (searchTerm: string, targetString: string): number => {
  const normalizedSearch = normalizeString(searchTerm);
  const normalizedTarget = normalizeString(targetString);

  if (!normalizedSearch) return 100; // If search is empty, everything is a perfect match.
  if (!normalizedTarget) return 0; // If target is empty, no match.
  if (normalizedTarget.includes(normalizedSearch)) return 100; // Perfect substring match is highest score.

  const words = normalizedSearch.split(' ');
  let totalScore = 0;

  for (const word of words) {
    let bestWordScore = 0;
    if (normalizedTarget.includes(word)) {
      bestWordScore = 1; // Direct word match
    } else {
      const targetWords = normalizedTarget.split(' ');
      for (const targetWord of targetWords) {
        const distance = calculateLevenshteinDistance(word, targetWord);
        const similarity = 1 - distance / Math.max(word.length, targetWord.length);
        if (similarity > bestWordScore) {
          bestWordScore = similarity;
        }
      }
    }
    // We only consider scores above a certain threshold to be relevant.
    totalScore += bestWordScore > 0.7 ? bestWordScore : 0;
  }
  return (totalScore / words.length) * 100;
};
