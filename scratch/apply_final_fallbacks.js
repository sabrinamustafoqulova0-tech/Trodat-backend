/**
 * For the 4 remaining stamps (46040, 46050, 54045, 5474) that have no large
 * images available online, copy from the best available same-series sibling
 * that is large AND square (same shape / same product family).
 * 
 * 46040 (round Ø40) → use 46045 or 4640 or 46025 (all round Printy)
 * 46050 (round Ø50) → use 46019 (round Printy, 53KB good)  
 * 54045 (Professional dater) → use 5430 (large, 229KB)
 * 5474  (Professional dater) → use 5480 (large, same family)
 */
const fs = require('fs');
const path = require('path');

const destDir = "C:/Users/User/Desktop/Project/react/public/images/stamps";

const fallbacks = [
  { article: "46040", source: "46025.jpg" }, // Printy Round 25mm → close enough
  { article: "46050", source: "46019.jpg" }, // Printy Round from 46019 page (53KB)
  { article: "54045", source: "5430.jpg"  }, // Professional Dater 229KB
  { article: "5474",  source: "5480.jpg"  }, // Professional Dater 5480
];

for (const { article, source } of fallbacks) {
  const srcPath = path.join(destDir, source);
  const dstPath = path.join(destDir, `${article}.jpg`);
  
  if (!fs.existsSync(srcPath)) {
    console.log(`❌ Source not found: ${source}`);
    continue;
  }
  
  const srcStats = fs.statSync(srcPath);
  const srcKB = Math.round(srcStats.size / 1024);
  
  if (fs.existsSync(dstPath)) fs.unlinkSync(dstPath);
  fs.copyFileSync(srcPath, dstPath);
  console.log(`✅ [${article}] ← copied from ${source} (${srcKB} KB)`);
}

console.log('\nFallback copy complete.');
