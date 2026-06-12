/**
 * scripts/check-i18n.js
 * So sánh key giữa vi.json (nguồn) và en/ko/zh.json
 * Chạy: node scripts/check-i18n.js
 */
const fs = require('fs');
const path = require('path');

const I18N_DIR = path.join(__dirname, '../frontend/src/assets/i18n');

function flattenKeys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) => {
    const full = prefix ? `${prefix}.${k}` : k;
    return typeof v === 'object' && v !== null && !Array.isArray(v)
      ? flattenKeys(v, full)
      : [full];
  });
}

function loadLang(lang) {
  const filePath = path.join(I18N_DIR, `${lang}.json`);
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(`Cannot read ${lang}.json: ${e.message}`);
    process.exit(1);
  }
}

const LANGS = ['vi', 'en', 'ko', 'zh'];
const [SOURCE, ...TARGETS] = LANGS;

const sourceKeys = flattenKeys(loadLang(SOURCE));
const sourceSet  = new Set(sourceKeys);

let totalMissing = 0;
let totalExtra   = 0;

console.log(`\n=== i18n Parity Report ===`);
console.log(`Source (${SOURCE}): ${sourceKeys.length} keys\n`);

for (const lang of TARGETS) {
  const targetKeys = flattenKeys(loadLang(lang));
  const targetSet  = new Set(targetKeys);

  const missing = sourceKeys.filter(k => !targetSet.has(k));
  const extra   = targetKeys.filter(k => !sourceSet.has(k));

  totalMissing += missing.length;
  totalExtra   += extra.length;

  const status = missing.length === 0 && extra.length === 0 ? '✅' : '❌';
  console.log(`${status} ${lang.toUpperCase()} — ${targetKeys.length} keys | Missing: ${missing.length} | Extra: ${extra.length}`);

  if (missing.length > 0) {
    console.log(`   Missing keys:`);
    missing.forEach(k => console.log(`     - ${k}`));
  }
  if (extra.length > 0) {
    console.log(`   Extra keys:`);
    extra.forEach(k => console.log(`     + ${k}`));
  }
}

console.log(`\nTotal missing: ${totalMissing} | Total extra: ${totalExtra}`);

if (totalMissing > 0) {
  process.exit(1);
} else {
  console.log('\n✅ i18n parity OK');
}
