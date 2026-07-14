const fs = require('fs');
const path = require('path');

const seedPath = "C:/Users/User/Desktop/Project/backend/prisma/seed.ts";
const destDir = "C:/Users/User/Desktop/Project/react/public/images/stamps";

function getJpegDimensions(buffer) {
  let i = 2;
  while (i < buffer.length) {
    if (buffer[i] !== 0xFF) {
      i++;
      continue;
    }
    const marker = buffer[i + 1];
    if (marker === 0xD9 || marker === 0xDA) break;
    if (marker === 0xC0 || marker === 0xC1 || marker === 0xC2 || marker === 0xC3 ||
        marker === 0xC5 || marker === 0xC6 || marker === 0xC7 ||
        marker === 0xC9 || marker === 0xCA || marker === 0xCB ||
        marker === 0xCD || marker === 0xCE || marker === 0xCF) {
      try {
        const height = buffer.readUInt16BE(i + 5);
        const width = buffer.readUInt16BE(i + 7);
        return { width, height };
      } catch (e) {
        return null;
      }
    }
    const length = buffer.readUInt16BE(i + 2);
    i += 2 + length;
  }
  return null;
}

function getPngDimensions(buffer) {
  if (buffer.readUInt32BE(12) === 0x49484452) {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
  }
  return null;
}

function checkNeedsHighRes(article) {
  const filePath = path.join(destDir, `${article}.jpg`);
  if (!fs.existsSync(filePath)) return { needs: true, reason: 'missing' };
  
  const stats = fs.statSync(filePath);
  if (stats.size < 12000) return { needs: true, reason: `low size (${Math.round(stats.size/1024)} KB)` };
  
  const buffer = fs.readFileSync(filePath);
  let dims = null;
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
    dims = getJpegDimensions(buffer);
  } else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    dims = getPngDimensions(buffer);
  }
  
  if (!dims) return { needs: false };
  if (dims.width < 350 || dims.height < 350) {
    return { needs: true, reason: `low dim (${dims.width}x${dims.height})` };
  }
  return { needs: false };
}

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

const remaining = [];
for (const stamp of stamps) {
  const check = checkNeedsHighRes(stamp.article);
  if (check.needs) {
    remaining.push({ ...stamp, reason: check.reason });
  }
}

console.log(`Total remaining low-res or missing stamps: ${remaining.length}`);
console.log(JSON.stringify(remaining, null, 2));
