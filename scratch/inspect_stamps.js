const fs = require('fs');
const path = require('path');

const seedPath = "C:/Users/User/Desktop/Project/backend/prisma/seed.ts";
const content = fs.readFileSync(seedPath, 'utf8');

// Match each stamp object
// We want to capture the article and name from each stamp block
const regex = /article:\s*'([^']+)'[\s\S]*?name:\s*'([^']+)'/g;
let match;
const stamps = [];
while ((match = regex.exec(content)) !== null) {
  stamps.push({ article: match[1], name: match[2] });
}

console.log(JSON.stringify(stamps, null, 2));
