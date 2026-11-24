'use strict';

// Tiny dependency-free "lint" step: syntax-checks every .js file and flags
// leftover debug statements. Swap for ESLint later:
//   npm i -D eslint   then set the "lint" script to "eslint ."
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const roots = ['src', 'test', 'scripts'];
const banned = new RegExp(['\\bdebug' + 'ger\\b', 'console\\.' + 'debug'].join('|'));
let failed = false;

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return walk(full);
    return full.endsWith('.js') ? [full] : [];
  });
}

for (const file of roots.filter((r) => fs.existsSync(r)).flatMap(walk)) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  } catch (err) {
    failed = true;
    console.error(`Syntax error in ${file}\n${err.stderr}`);
  }
  if (banned.test(fs.readFileSync(file, 'utf8'))) {
    failed = true;
    console.error(`Debug statement found in ${file}`);
  }
}

if (failed) process.exit(1);
console.log('Lint passed');
