/**
 * Fix the last 5 remaining low-dimension stamps by:
 * 1. Trying higher-resolution versions from trodat-russia.ru (iblock full-size, not resize_cache)
 * 2. For square/round items that are portrait-cropped, try to find the correct sibling with square casing
 */
const fs = require('fs');
const https = require('https');
const path = require('path');
const urlModule = require('url');

const destDir = "C:/Users/User/Desktop/Project/react/public/images/stamps";

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
};

const targets = [
  // 46040/46050 are round stamps — their images are portrait (square face + handle) so 373x328 may be intentional
  // Let's try fetching full iblock versions to get larger resolution
  { article: "46040", url: "https://trodat-russia.ru/catalog/printy/kruglye-pechati/46040/" },
  { article: "46050", url: "https://trodat-russia.ru/catalog/printy/kruglye-pechati/46050/" },
  { article: "46140", url: "https://trodat-russia.ru/catalog/printy/datery-so-svobodnym-polem/46140/" },
  { article: "54045", url: "https://trodat-russia.ru/catalog/professional/datery-so-svobodnym-polem-datery/54045/" },
  { article: "5474", url: "https://trodat-russia.ru/catalog/professional/datery-so-svobodnym-polem-datery/5474/" }
];

function fetchUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { headers, timeout: 10000 }, (res) => {
      if (res.statusCode !== 200) { resolve(''); return; }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers, timeout: 15000 }, (res) => {
      if (res.statusCode !== 200) {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        reject(new Error(`Status ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', err => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function run() {
  for (const target of targets) {
    console.log(`\n[${target.article}] Fetching page: ${target.url}`);
    const html = await fetchUrl(target.url);
    if (!html) { console.log('  ❌ No page HTML'); continue; }

    // Extract all /upload/ images
    const imgRe = /<img[^>]+src="([^"]+)"[^>]*>/gi;
    let m;
    const candidates = [];
    while ((m = imgRe.exec(html)) !== null) {
      const src = m[1];
      const full = urlModule.resolve(target.url, src);
      const low = full.toLowerCase();
      if (
        low.includes('/upload/') &&
        !low.includes('logo') &&
        !low.includes('icon') &&
        !low.includes('flag') &&
        !low.includes('podush') &&
        !low.includes('pad')
      ) {
        // Prefer FULL iblock (not resize_cache) for maximum resolution
        candidates.push({ url: full, isFullRes: !low.includes('resize_cache') });
      }
    }

    if (!candidates.length) { console.log('  ❌ No /upload/ images'); continue; }

    // Sort: full-res first, then by article match score
    candidates.sort((a, b) => {
      let sa = (a.isFullRes ? 100 : 0) + (a.url.includes(target.article) ? 50 : 0);
      let sb = (b.isFullRes ? 100 : 0) + (b.url.includes(target.article) ? 50 : 0);
      return sb - sa;
    });

    const bestUrl = candidates[0].url;
    console.log(`  Best candidate: ${bestUrl} (fullRes=${candidates[0].isFullRes})`);

    const tempPath = path.join(destDir, `${target.article}_fixtemp.jpg`);
    const destPath = path.join(destDir, `${target.article}.jpg`);

    try {
      await downloadImage(bestUrl, tempPath);
      const stats = fs.statSync(tempPath);
      const sizekb = Math.round(stats.size / 1024);

      if (stats.size > 20000) {
        if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
        fs.renameSync(tempPath, destPath);
        console.log(`  ✅ Downloaded (${sizekb} KB) → ${destPath}`);
      } else {
        console.log(`  ⚠️ Downloaded (${sizekb} KB) — too small, keeping existing.`);
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      }
    } catch (e) {
      console.log(`  ❌ Error: ${e.message}`);
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }

    await sleep(500);
  }
  console.log('\nDone.');
}

run();
