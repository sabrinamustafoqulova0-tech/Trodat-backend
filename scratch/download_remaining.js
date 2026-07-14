const fs = require('fs');
const https = require('https');
const path = require('path');

const seedPath = "C:/Users/User/Desktop/Project/backend/prisma/seed.ts";
const destDir = "C:/Users/User/Desktop/Project/react/public/images/stamps";

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Helper for sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

// Filter stamps that need update (don't exist or size < 10KB)
const stampsToDownload = stamps.filter(stamp => {
  const filePath = path.join(destDir, `${stamp.article}.jpg`);
  if (!fs.existsSync(filePath)) {
    return true;
  }
  const stats = fs.statSync(filePath);
  return stats.size < 10000; // less than 10KB
});

console.log(`Stamps needing high-res download: ${stampsToDownload.length}`);

// Helper to perform HEAD request with status verification
function checkUrl(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
      if (res.statusCode === 429) {
        resolve({ ok: false, rateLimited: true });
      } else {
        resolve({ ok: res.statusCode === 200, rateLimited: false });
      }
    });
    req.on('error', () => resolve({ ok: false, rateLimited: false }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, rateLimited: false });
    });
    req.end();
  });
}

// Helper to download file
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { timeout: 10000 }, (res) => {
      if (res.statusCode === 429) {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        reject(new Error("RATE_LIMIT"));
        return;
      }
      if (res.statusCode !== 200) {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        reject(new Error(`Status ${res.statusCode}`));
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

// Generate candidate URLs
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
  } else if (ser === 'professional') {
    candidates.push(`https://www.thestampmaker.com/images/products/trodat-${art}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/trodat-professional-${art}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/trodat-professional-${cleanArt}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/trodat-${cleanArt}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/TRODAT_PROFESSIONAL_${art}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/TRODAT_PROFESSIONAL_${cleanArt.toUpperCase()}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/TRODAT_${art}.jpg`);
  } else if (ser === 'mobile' || ser === 'pocket') {
    candidates.push(`https://www.thestampmaker.com/images/products/trodat-mobile-printy-${art}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/trodat-mobile-printy-${cleanArt}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/trodat-pocket-printy-${art}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/trodat-pocket-printy-${cleanArt}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/trodat-mobile-${art}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/TRODAT_MOBILE_PRINTY_${art}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/TRODAT_POCKET_PRINTY_${art}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/TRODAT_MOBILE_${art}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/TRODAT_POCKET_${art}.jpg`);
  } else if (ser === 'ideal') {
    candidates.push(`https://www.thestampmaker.com/images/products/trodat-ideal-${art}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/trodat-ideal-${cleanArt}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/TRODAT_IDEAL_${art}.jpg`);
  }

  // Accessories/others direct checks
  candidates.push(`https://www.thestampmaker.com/images/products/TRODAT_STAMP_PAD_${art}.jpg`);
  candidates.push(`https://www.thestampmaker.com/images/products/trodat-stamp-pad-${art}.jpg`);
  candidates.push(`https://www.thestampmaker.com/images/products/TRODAT_STAMP_INK_${art}.jpg`);
  candidates.push(`https://www.thestampmaker.com/images/products/trodat-stamp-ink-${art}.jpg`);

  // Generic fallbacks
  candidates.push(`https://www.thestampmaker.com/images/products/trodat-${art}.jpg`);
  candidates.push(`https://www.thestampmaker.com/images/products/trodat-${cleanArt}.jpg`);
  candidates.push(`https://www.thestampmaker.com/images/products/${art}.jpg`);
  candidates.push(`https://www.thestampmaker.com/images/products/${cleanArt}.jpg`);
  candidates.push(`https://www.thestampmaker.com/images/products/TRODAT_${art}.jpg`);
  candidates.push(`https://www.thestampmaker.com/images/products/${art.toUpperCase()}.jpg`);

  return [...new Set(candidates)];
}

async function run() {
  console.log("Starting sequential high-res stamp image downloader...");
  let downloadedCount = 0;
  let failedCount = 0;

  for (let i = 0; i < stampsToDownload.length; i++) {
    const stamp = stampsToDownload[i];
    const candidates = getCandidates(stamp);
    let matchedUrl = null;

    console.log(`\n[${i+1}/${stampsToDownload.length}] Checking ${stamp.article} (Name: ${stamp.name}, Series: ${stamp.series})...`);

    // Test candidates sequentially with delay
    for (const url of candidates) {
      await sleep(1500); // 1.5s delay to avoid rate limit
      
      const check = await checkUrl(url);
      
      if (check.rateLimited) {
        console.log(`⚠️ Rate limited (429) on HEAD check. Sleeping for 30s...`);
        await sleep(30000);
        // retry the same URL
        const retryCheck = await checkUrl(url);
        if (retryCheck.ok) {
          matchedUrl = url;
          break;
        }
      } else if (check.ok) {
        matchedUrl = url;
        break;
      }
    }

    if (matchedUrl) {
      const downloadUrl = `${matchedUrl}.ashx?width=600&height=600&quality=90&scale=canvas`;
      const destPath = path.join(destDir, `${stamp.article}.jpg`);
      
      await sleep(1500);
      try {
        await downloadFile(downloadUrl, destPath);
        downloadedCount++;
        console.log(`✅ SUCCESS: Downloaded ${stamp.article} from ${matchedUrl}`);
      } catch (err) {
        if (err.message === "RATE_LIMIT") {
          console.log(`⚠️ Rate limited (429) on download. Sleeping for 30s...`);
          await sleep(30000);
          try {
            await downloadFile(downloadUrl, destPath);
            downloadedCount++;
            console.log(`✅ SUCCESS (after retry): Downloaded ${stamp.article}`);
          } catch (retryErr) {
            failedCount++;
            console.error(`❌ FAILED download after retry for ${stamp.article}: ${retryErr.message}`);
          }
        } else {
          failedCount++;
          console.error(`❌ FAILED download for ${stamp.article}: ${err.message}`);
        }
      }
    } else {
      failedCount++;
      console.log(`❌ NOT FOUND: No image found for ${stamp.article}`);
    }
  }

  console.log(`\n=== Downloader Summary ===`);
  console.log(`Successfully Downloaded: ${downloadedCount}`);
  console.log(`Failed / Not Found: ${failedCount}`);
}

run();
