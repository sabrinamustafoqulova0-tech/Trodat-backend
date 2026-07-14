const fs = require('fs');

const seedPath = "C:/Users/User/Desktop/Project/backend/prisma/seed.ts";
const content = fs.readFileSync(seedPath, 'utf8');

const colorsRegex = /colors:\s*\[([^\]]+)\]/g;
let match;
const allColors = new Set();

while ((match = colorsRegex.exec(content)) !== null) {
  const colors = match[1].split(',').map(c => c.trim().replace(/['"]/g, ''));
  colors.forEach(c => allColors.add(c));
}

console.log('All colors found in seed.ts:', Array.from(allColors));
