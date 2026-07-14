const fs = require('fs');
const path = require('path');

const destDir = "C:/Users/User/Desktop/Project/react/public/images/stamps";
const seedPath = "C:/Users/User/Desktop/Project/backend/prisma/seed.ts";

// Parse all stamps from seed.ts
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

// Find files and sizes
const files = fs.readdirSync(destDir);
const fileMap = {};
for (const file of files) {
  if (file.endsWith('.jpg') || file.endsWith('.png')) {
    const stats = fs.statSync(path.join(destDir, file));
    fileMap[file] = stats.size;
  }
}

// Group stamps by series and list high-res ones (> 20KB)
const groups = {};
for (const stamp of stamps) {
  const filename = `${stamp.article}.jpg`;
  const size = fileMap[filename] || 0;
  if (!groups[stamp.series]) groups[stamp.series] = [];
  groups[stamp.series].push({ ...stamp, filename, size });
}

for (const series in groups) {
  console.log(`\nSeries: ${series}`);
  const highRes = groups[series]
    .filter(s => s.size > 20000)
    .sort((a, b) => b.size - a.score);
  
  console.log(`  High-res options (Count: ${highRes.length}):`);
  console.log(highRes.slice(0, 5).map(s => `    - ${s.article} | ${s.name} | ${Math.round(s.size/1024)} KB`));
}
