const fs = require('fs');
const https = require('https');
const path = require('path');

const seedPath = "C:/Users/User/Desktop/Project/backend/prisma/seed.ts";
const destDir = "C:/Users/User/Desktop/Project/react/public/images/stamps";

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Parse stamps from seed.ts
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

console.log(`Parsed ${stamps.length} unique stamps from seed.ts`);

// Helper to perform HEAD request
function checkUrl(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

// Helper to download file
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { timeout: 10000 }, (res) => {
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        reject(new Error(`Failed with status ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });
  });
}

// Generate all candidate URLs for a stamp
function getCandidates(stamp) {
  const art = stamp.article;
  const ser = stamp.series;
  const candidates = [];

  const cleanArt = art.replace(/\s+Dater/gi, '')
                      .replace(/\s+Numerator/gi, '')
                      .replace(/\s+/g, '-')
                      .toLowerCase();

  // 1. Direct series-based candidates
  if (ser === 'printy') {
    candidates.push(`https://www.thestampmaker.com/images/products/trodat-printy-${art}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/trodat-printy-${cleanArt}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/TRODAT_PRINTY_${art}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/TRODAT_PRINTY_${cleanArt.toUpperCase()}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/trodat_printy_${art}.jpg`);
  } else if (ser === 'professional') {
    candidates.push(`https://www.thestampmaker.com/images/products/trodat-${art}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/trodat-professional-${art}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/trodat-professional-${cleanArt}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/trodat-${cleanArt}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/TRODAT_PROFESSIONAL_${art}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/TRODAT_PROFESSIONAL_${cleanArt.toUpperCase()}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/TRODAT_${art}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/trodat_professional_${art}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/trodat_professional_${cleanArt}.jpg`);
  } else if (ser === 'mobile' || ser === 'pocket') {
    candidates.push(`https://www.thestampmaker.com/images/products/trodat-mobile-printy-${art}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/trodat-mobile-printy-${cleanArt}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/trodat-pocket-printy-${art}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/trodat-pocket-printy-${cleanArt}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/trodat-mobile-${art}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/trodat-mobile-${cleanArt}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/TRODAT_MOBILE_PRINTY_${art}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/TRODAT_POCKET_PRINTY_${art}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/TRODAT_MOBILE_${art}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/TRODAT_POCKET_${art}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/trodat_mobile_printy_${art}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/trodat_pocket_printy_${art}.jpg`);
  } else if (ser === 'ideal') {
    candidates.push(`https://www.thestampmaker.com/images/products/trodat-ideal-${art}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/trodat-ideal-${cleanArt}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/TRODAT_IDEAL_${art}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/trodat_ideal_${art}.jpg`);
  }

  // Accessories/others direct checks
  candidates.push(`https://www.thestampmaker.com/images/products/TRODAT_STAMP_PAD_${art}.jpg`);
  candidates.push(`https://www.thestampmaker.com/images/products/trodat-stamp-pad-${art}.jpg`);
  candidates.push(`https://www.thestampmaker.com/images/products/trodat_stamp_pad_${art}.jpg`);
  candidates.push(`https://www.thestampmaker.com/images/products/TRODAT_STAMP_INK_${art}.jpg`);
  candidates.push(`https://www.thestampmaker.com/images/products/trodat-stamp-ink-${art}.jpg`);
  candidates.push(`https://www.thestampmaker.com/images/products/trodat_stamp_ink_${art}.jpg`);

  // 2. Generic fallbacks
  candidates.push(`https://www.thestampmaker.com/images/products/trodat-${art}.jpg`);
  candidates.push(`https://www.thestampmaker.com/images/products/trodat-${cleanArt}.jpg`);
  candidates.push(`https://www.thestampmaker.com/images/products/${art}.jpg`);
  candidates.push(`https://www.thestampmaker.com/images/products/${cleanArt}.jpg`);
  candidates.push(`https://www.thestampmaker.com/images/products/TRODAT_${art}.jpg`);
  candidates.push(`https://www.thestampmaker.com/images/products/trodat_${art}.jpg`);
  candidates.push(`https://www.thestampmaker.com/images/products/${art.toUpperCase()}.jpg`);
  candidates.push(`https://www.thestampmaker.com/images/products/${cleanArt.toUpperCase()}.jpg`);


  // 3. Remove duplicates
  return [...new Set(candidates)];
}

// Concurrency limit helper
async function mapLimit(items, limit, fn) {
  const results = [];
  const executing = [];
  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item));
    results.push(p);
    if (limit <= items.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(results);
}

let downloadedCount = 0;
let failedCount = 0;

async function processStamp(stamp, index, total) {
  const candidates = getCandidates(stamp);
  let matchedUrl = null;

  // Check candidates in parallel for this stamp
  const checks = await Promise.all(candidates.map(async (url) => {
    const ok = await checkUrl(url);
    return { url, ok };
  }));

  const found = checks.find(c => c.ok);
  if (found) {
    matchedUrl = found.url;
  }

  if (matchedUrl) {
    // We want to download the image with .ashx parameters to get a nice high-res webp or jpeg,
    // but save it as article.jpg (or article.webp and we update seed.ts, let's keep article.jpg to avoid breaking existing DB records).
    // Let's request it with scale=canvas, width=600, height=600, quality=90.
    const downloadUrl = `${matchedUrl}.ashx?width=600&height=600&quality=90&scale=canvas`;
    const destPath = path.join(destDir, `${stamp.article}.jpg`);
    
    try {
      await downloadFile(downloadUrl, destPath);
      downloadedCount++;
      console.log(`[${index}/${total}] SUCCESS: Downloaded ${stamp.article} from ${matchedUrl}`);
    } catch (err) {
      failedCount++;
      console.error(`[${index}/${total}] ERROR: Failed downloading ${stamp.article} from ${downloadUrl}: ${err.message}`);
    }
  } else {
    failedCount++;
    console.log(`[${index}/${total}] NOT FOUND: No image found for ${stamp.article} (Name: ${stamp.name})`);
  }
}

async function run() {
  console.log("Starting parallel stamp image downloader...");
  const total = stamps.length;
  
  await mapLimit(stamps, 5, (stamp) => {
    const index = stamps.indexOf(stamp) + 1;
    return processStamp(stamp, index, total);
  });

  console.log(`\n=== Downloader Summary ===`);
  console.log(`Successfully Downloaded: ${downloadedCount}`);
  console.log(`Failed / Not Found: ${failedCount}`);
}

run();
