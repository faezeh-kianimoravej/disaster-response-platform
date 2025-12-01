#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const p = path.resolve(process.cwd(), 'client-app', 'test-results', 'junit.xml');
if (!fs.existsSync(p)) {
  console.error('junit.xml not found at', p);
  process.exit(2);
}
const xml = fs.readFileSync(p, 'utf8');
const re = /tests="(\d+)"/g;
let m; const numbers = [];
while ((m = re.exec(xml)) !== null) numbers.push(parseInt(m[1], 10));
const total = numbers.reduce((a,b) => a + b, 0);
console.log(total);
