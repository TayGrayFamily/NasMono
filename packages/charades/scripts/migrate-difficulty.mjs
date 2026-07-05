#!/usr/bin/env node
/**
 * Migrate remaining enum difficulty strings (handles double-quoted text fields).
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '../src/data');

const EASY_LEVELS = [1, 2, 3, 4];
const MEDIUM_LEVELS = [4, 5, 6, 7];
const HARD_LEVELS = [7, 8, 9, 10];

function hashId(id) {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return h;
}

function mapTierToLevel(tier, cardId) {
  const h = hashId(cardId);
  if (tier === 'easy') return EASY_LEVELS[h % EASY_LEVELS.length];
  if (tier === 'medium') return MEDIUM_LEVELS[h % MEDIUM_LEVELS.length];
  if (tier === 'hard') return HARD_LEVELS[h % HARD_LEVELS.length];
  return Number(tier);
}

const CARD_RE =
  /card\(\s*'([^']+)'\s*,\s*(?:'((?:\\'|[^'])*)'|"((?:\\"|[^"])*)")\s*,\s*'([^']+)'\s*,\s*'(easy|medium|hard)'/g;

function migrateFile(filePath) {
  let content = readFileSync(filePath, 'utf8');
  let changed = 0;

  content = content.replace(CARD_RE, (match, id, _singleText, _doubleText, type, tier) => {
    const level = mapTierToLevel(tier, id);
    changed += 1;
    return match.replace(`, '${tier}'`, `, ${level}`);
  });

  if (changed > 0) {
    writeFileSync(filePath, content);
    console.log(`${filePath}: migrated ${changed} cards`);
  }
}

const files = readdirSync(dataDir).filter(
  (f) => f.endsWith('.ts') && f !== 'helpers.ts' && f !== 'generation-tags.ts' && f !== 'index.ts',
);
for (const file of files) {
  migrateFile(join(dataDir, file));
}

console.log('Done.');
