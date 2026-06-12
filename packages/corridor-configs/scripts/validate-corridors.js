#!/usr/bin/env node
/**
 * Validates all corridor configs against the JSON schema.
 * Run: npm run validate -w packages/corridor-configs
 */
const Ajv = require('ajv');
const fs  = require('fs');
const path = require('path');

const ajv = new Ajv({ allErrors: true });
const schema = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../schemas/corridor.schema.json'), 'utf8')
);
const validate = ajv.compile(schema);

const corridorsDir = path.join(__dirname, '../corridors');
const corridors = fs.readdirSync(corridorsDir).filter(
  d => fs.statSync(path.join(corridorsDir, d)).isDirectory()
);

let passed = 0; let failed = 0;
for (const code of corridors) {
  const cfgPath = path.join(corridorsDir, code, 'config.json');
  if (!fs.existsSync(cfgPath)) { console.warn(`  SKIP ${code} — no config.json`); continue; }
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  const valid = validate(cfg);
  if (valid) {
    console.log(`  ✓  ${code}`);
    passed++;
  } else {
    console.error(`  ✗  ${code}`);
    for (const err of validate.errors) console.error(`       ${err.instancePath} ${err.message}`);
    failed++;
  }
}
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
