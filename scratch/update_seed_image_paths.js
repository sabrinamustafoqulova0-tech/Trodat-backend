const fs = require('fs');

const seedPath = "C:/Users/User/Desktop/Project/backend/prisma/seed.ts";
let content = fs.readFileSync(seedPath, 'utf8');

// We want to find each stamp block and replace its imageMain: '...' with imageMain: '/images/stamps/[article].jpg'
// Stamp block starts with { and contains article: '...', and imageMain: '...'

const lines = content.split(/\r?\n/);
let inStamp = false;
let currentArticle = null;
let updatedCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  if (line.includes('{')) {
    inStamp = true;
  }
  
  if (inStamp) {
    const artMatch = line.match(/article:\s*'([^']+)'/);
    if (artMatch) {
      currentArticle = artMatch[1];
    }
    
    if (line.includes('imageMain:') && currentArticle) {
      const expectedPath = `/images/stamps/${currentArticle}.jpg`;
      const currentPathMatch = line.match(/imageMain:\s*'([^']+)'/);
      
      if (currentPathMatch && currentPathMatch[1] !== expectedPath) {
        console.log(`Replacing line ${i+1}:`);
        console.log(`  OLD: ${line.trim()}`);
        lines[i] = line.replace(/imageMain:\s*'[^']+'/, `imageMain: '${expectedPath}'`);
        console.log(`  NEW: ${lines[i].trim()}`);
        updatedCount++;
      }
    }
  }
  
  if (line.includes('},')) {
    inStamp = false;
    currentArticle = null;
  }
}

if (updatedCount > 0) {
  fs.writeFileSync(seedPath, lines.join('\n'));
  console.log(`\nSuccessfully updated ${updatedCount} image paths in seed.ts!`);
} else {
  console.log('\nAll image paths in seed.ts were already correct!');
}
