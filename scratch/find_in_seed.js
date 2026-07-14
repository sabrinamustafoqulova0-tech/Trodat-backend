const fs = require('fs');
const content = fs.readFileSync('C:/Users/User/Desktop/Project/backend/prisma/seed.ts', 'utf8');
const lines = content.split(/\r?\n/);
const targets = ['5274', '54110', '54140'];

for (const target of targets) {
  console.log(`\nSearching for ${target}...`);
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(target)) {
      console.log(`Line ${i + 1}: ${lines[i]}`);
      console.log(`Line ${i + 2}: ${lines[i+1]}`);
      console.log(`Line ${i + 3}: ${lines[i+2]}`);
      console.log(`Line ${i + 4}: ${lines[i+3]}`);
    }
  }
}
