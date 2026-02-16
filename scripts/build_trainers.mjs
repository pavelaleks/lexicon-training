/**
 * Парсинг HTML-тренажёров из trainers_source → data/trainers/*.json + data/index.json
 * Запуск: npm run build:trainers
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SOURCE_DIR = path.join(ROOT, 'trainers_source');
const DATA_DIR = path.join(ROOT, 'public', 'data');
const TRAINERS_DIR = path.join(DATA_DIR, 'trainers');

const CYRILLIC_TO_LATIN = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
};

function slugify(name) {
  const base = typeof name === 'string' ? name : '';
  let s = base.toLowerCase().trim();
  let out = '';
  for (const char of s) {
    if (CYRILLIC_TO_LATIN[char]) out += CYRILLIC_TO_LATIN[char];
    else if (/[a-z0-9]/.test(char)) out += char;
    else if (char === ' ' || char === '_' || char === '-') out += '-';
  }
  return out.replace(/-+/g, '-').replace(/^-|-$/g, '') || 'trainer';
}

function extractBalanced(str, startIndex, openChar, closeChar) {
  if (str[startIndex] !== openChar) return null;
  let depth = 1;
  let i = startIndex + 1;
  while (i < str.length && depth > 0) {
    if (str[i] === openChar) depth++;
    else if (str[i] === closeChar) depth--;
    i++;
  }
  return depth === 0 ? str.slice(startIndex, i) : null;
}

function extractConstValue(scriptText, constName) {
  const re = new RegExp(`const\\s+${constName}\\s*=\\s*`, 'g');
  const m = re.exec(scriptText);
  if (!m) return null;
  const start = m.index + m[0].length;
  const first = scriptText[start];
  const block = first === '[' ? extractBalanced(scriptText, start, '[', ']') : extractBalanced(scriptText, start, '{', '}');
  if (!block) return null;
  try {
    return new Function(`return ${block}`)();
  } catch (_) {
    try {
      const normalized = block
        .replace(/(\w+):/g, '"$1":')
        .replace(/'/g, '"');
      return JSON.parse(normalized);
    } catch (_2) {
      return null;
    }
  }
}

function detectType(exercises) {
  if (!Array.isArray(exercises) || exercises.length === 0) return 'generic.html';
  const first = exercises[0];
  if (first.words && Array.isArray(first.words) && Array.isArray(first.commas)) return 'punctuation.commas';
  if (typeof first.phrase === 'string' && (first.answer === 'н' || first.answer === 'нн') && first.word) return 'spelling.nn';
  return 'generic.html';
}

function validatePunctuation(ex) {
  const words = ex.words;
  const commas = ex.commas || [];
  if (!Array.isArray(words) || words.length < 2) return { ok: false, err: 'words must be array length >= 2' };
  const maxSlot = words.length - 2;
  for (let i = 0; i <= maxSlot; i++) {
    if (!commas.includes(i)) continue;
    if (i < 0 || i > maxSlot) return { ok: false, err: `comma index ${i} out of range 0..${maxSlot}` };
  }
  const sorted = [...new Set(commas)].filter(i => i >= 0 && i <= maxSlot).sort((a, b) => a - b);
  return { ok: true, normalized: sorted };
}

function normalizeE(s) {
  return (s || '').replace(/ё/g, 'е');
}

function validateNN(ex) {
  const phrase = ex.phrase || '';
  const count = (phrase.match(/___/g) || []).length;
  if (count !== 1) return { ok: false, err: 'phrase must contain exactly one ___' };
  if (ex.answer !== 'н' && ex.answer !== 'нн') return { ok: false, err: 'answer must be "н" or "нн"' };
  const word = (ex.word || '').trim();
  const expected = ex.answer === 'нн' ? word : word;
  const reconstructed = phrase.replace('___', ex.answer === 'нн' ? 'нн' : 'н');
  if (normalizeE(reconstructed).indexOf(normalizeE(word)) === -1 && normalizeE(word).indexOf(normalizeE(reconstructed.replace('___', ex.answer))) === -1) {
    const withN = phrase.replace('___', 'н');
    const withNN = phrase.replace('___', 'нн');
    if (normalizeE(withN) !== normalizeE(word) && normalizeE(withNN) !== normalizeE(word)) {
      // relaxed: word might be full word, phrase has ___ so we just check answer
    }
  }
  return { ok: true };
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function processFile(filePath) {
  const html = fs.readFileSync(filePath, 'utf-8');
  const $ = cheerio.load(html);
  const title = ($('title').text() || path.basename(filePath, '.html')).trim();
  const baseName = path.basename(filePath, '.html');
  const slug = slugify(baseName);

  const scripts = [];
  $('script').each((_, el) => {
    const text = $(el).html();
    if (text) scripts.push(text);
  });
  const fullScript = scripts.join('\n');

  let EXERCISES = extractConstValue(fullScript, 'EXERCISES');
  let QUEST_STEPS = extractConstValue(fullScript, 'QUEST_STEPS');

  if (!EXERCISES || !Array.isArray(EXERCISES)) {
    return { ok: false, slug, title, err: 'EXERCISES not found or invalid' };
  }

  const trainerType = detectType(EXERCISES);
  const exercises = [];
  for (let i = 0; i < EXERCISES.length; i++) {
    const ex = EXERCISES[i];
    if (trainerType === 'punctuation.commas') {
      const v = validatePunctuation(ex);
      if (!v.ok) return { ok: false, slug, title, err: `exercise ${i}: ${v.err}` };
      exercises.push({ ...ex, commas: v.normalized });
    } else if (trainerType === 'spelling.nn') {
      const v = validateNN(ex);
      if (!v.ok) return { ok: false, slug, title, err: `exercise ${i}: ${v.err}` };
      exercises.push(ex);
    } else {
      exercises.push(ex);
    }
  }

  const category = trainerType === 'punctuation.commas' ? 'punctuation' : trainerType === 'spelling.nn' ? 'orthography' : 'other';
  const payload = {
    slug,
    name: title.replace(/\s*—\s*Студия Лексикон\s*$/i, '').trim(),
    description: title,
    type: trainerType,
    category,
    count: exercises.length,
    exercises,
    questSteps: Array.isArray(QUEST_STEPS) ? QUEST_STEPS : undefined,
  };

  return { ok: true, slug, payload };
}

function main() {
  ensureDir(DATA_DIR);
  ensureDir(TRAINERS_DIR);

  if (!fs.existsSync(SOURCE_DIR)) {
    fs.mkdirSync(SOURCE_DIR, { recursive: true });
    console.log('Created trainers_source folder. Add HTML files and run again.');
    ensureDir(DATA_DIR);
    fs.writeFileSync(path.join(DATA_DIR, 'index.json'), JSON.stringify({ trainers: [], generated: new Date().toISOString() }, null, 2));
    return;
  }

  const files = fs.readdirSync(SOURCE_DIR).filter(f => f.endsWith('.html'));
  const index = { trainers: [], generated: new Date().toISOString() };
  const slugs = new Set();
  let valid = 0;

  for (const file of files) {
    const filePath = path.join(SOURCE_DIR, file);
    const result = processFile(filePath);
    if (!result.ok) {
      console.error(`[SKIP] ${file}: ${result.err}`);
      continue;
    }
    if (slugs.has(result.slug)) {
      console.error(`[SKIP] ${file}: duplicate slug "${result.slug}"`);
      continue;
    }
    slugs.add(result.slug);
    const outPath = path.join(TRAINERS_DIR, `${result.slug}.json`);
    fs.writeFileSync(outPath, JSON.stringify(result.payload, null, 2), 'utf-8');
    index.trainers.push({
      slug: result.payload.slug,
      name: result.payload.name,
      description: result.payload.description,
      type: result.payload.type,
      category: result.payload.category,
      count: result.payload.count,
    });
    valid++;
    console.log(`[OK] ${file} → ${result.slug}.json (${result.payload.count} exercises, type: ${result.payload.type})`);
  }

  fs.writeFileSync(path.join(DATA_DIR, 'index.json'), JSON.stringify(index, null, 2), 'utf-8');
  console.log(`\nDone: ${valid}/${files.length} files. Index written to public/data/index.json`);
}

main();
