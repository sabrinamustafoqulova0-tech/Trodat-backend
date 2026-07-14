const fs = require('fs');
const path = require('path');

const seedPath = "C:/Users/User/Desktop/Project/backend/prisma/seed.ts";
const destDir = "C:/Users/User/Desktop/Project/react/public/images/stamps";

const content = fs.readFileSync(seedPath, 'utf8');
const regex = /article:\s*'([^']+)'[\s\S]*?name:\s*'([^']+)'[\s\S]*?series:\s*'([^']+)'/g;
let match;
const stamps = [];
const seenArticles = new Set();

while ((match = regex.exec(content)) !== null) {
  const article = match[1];
  if (!seenArticles.has(article)) {
    seenArticles.add(article);
    stamps.push({
      article,
      name: match[2],
      series: match[3].toLowerCase()
    });
  }
}

console.log(`Total unique stamps in seed.ts: ${stamps.length}`);

const lowRes = [];
for (const stamp of stamps) {
  const filePath = path.join(destDir, `${stamp.article}.jpg`);
  if (!fs.existsSync(filePath)) {
    lowRes.push({ ...stamp, reason: 'Does not exist' });
  } else {
    const stats = fs.statSync(filePath);
    if (stats.size < 10000) {
      lowRes.push({ ...stamp, reason: `Low-res (${Math.round(stats.size/1024)} KB)` });
    }
  }
}

console.log(`\nStamps lacking high-res images (${lowRes.length}):`);
lowRes.forEach(stamp => {
  console.log(`- Article: ${stamp.article} | Name: ${stamp.name} | Series: ${stamp.series} | Status: ${stamp.reason}`);
});
