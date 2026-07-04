/** Giphy `/v1/gifs/search` max `q` length per API docs. */
export const GIPHY_QUERY_MAX_LENGTH = 50;

const GENERIC_GIPHY_TERMS = new Set([
  'anime',
  'manga',
  'gif',
  'gifs',
  'character',
  'reaction',
  'the',
  'and',
]);

/** Trim and cap length at a word boundary when possible. */
export function truncateGiphyQuery(query: string): string {
  const trimmed = query.trim().replace(/\s+/g, ' ');
  if (trimmed.length <= GIPHY_QUERY_MAX_LENGTH) return trimmed;

  const slice = trimmed.slice(0, GIPHY_QUERY_MAX_LENGTH);
  const lastSpace = slice.lastIndexOf(' ');
  if (lastSpace > GIPHY_QUERY_MAX_LENGTH * 0.5) {
    return slice.slice(0, lastSpace).trim();
  }
  return slice.trim();
}

/** Drop formal prefixes so queries match how GIFs are tagged on Giphy (English). */
export function shortenAnimeSeries(source: string): string {
  return source
    .replace(/^Puella Magi\s+/i, '')
    .replace(/^Neon Genesis\s+/i, '')
    .replace(/['']s Bizarre Adventure$/i, '')
    .trim();
}

/** Distinctive terms for post-search ranking — excludes broad tags like "anime". */
export function meaningfulGiphyTerms(query: string): string[] {
  const seen = new Set<string>();
  const terms: string[] = [];

  for (const raw of query.toLowerCase().split(/\s+/)) {
    const term = raw.replace(/^[^\w]+|[^\w]+$/g, '');
    if (term.length <= 2 || GENERIC_GIPHY_TERMS.has(term) || seen.has(term)) continue;
    seen.add(term);
    terms.push(term);
  }

  return terms;
}

export function buildAnimeCharacterImageSearch(character: string, series: string): string {
  return truncateGiphyQuery(`${character} ${shortenAnimeSeries(series)}`);
}
