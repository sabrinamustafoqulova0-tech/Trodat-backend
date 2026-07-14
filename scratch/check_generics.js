const fs = require('fs');
const content = fs.readFileSync('C:/Users/User/Desktop/Project/backend/prisma/seed.ts', 'utf8');
const lines = content.split(/\r?\n/);

const generics = ['professional.png', 'mobile.png', 'ideal.png'];

for (let i = 0; i < lines.length; i++) {
  for (const gen of generics) {
    if (lines[i].includes(gen)) {
      console.log(`Line ${i + 1}: ${lines[i]}`);
      // find the stamp article by looking backwards
      let art = '';
      let name = '';
      for (let j = i; j >= 0; j--) {
        if (lines[j].includes('article:')) {
          art = lines[j];
        }
        if (lines[j].includes('name:')) {
          name = lines[j];
        }
        if (lines[j].includes('{') && !lines[j].includes('}')) {
          break;
        }
      }
      console.log(`  Belongs to: ${art.trim()} | ${name.trim()}`);
    }
  }
}
