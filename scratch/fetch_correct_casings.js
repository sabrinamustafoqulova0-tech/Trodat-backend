const fs = require('fs');
const https = require('https');
const path = require('path');
const urlModule = require('url');

const destDir = "C:/Users/User/Desktop/Project/react/public/images/stamps";

const targets = [
  { article: "4727", url: "https://trodat-russia.ru/catalog/printy/datery-so-svobodnym-polem/4727/" },
  { article: "4927", url: "https://trodat-russia.ru/catalog/printy/tekstovye-shtampy/4927/" },
  { article: "4914", url: "https://trodat-russia.ru/catalog/printy/tekstovye-shtampy/4914/" },
  { article: "46119", url: "https://trodat-russia.ru/catalog/printy/kruglye-pechati/46019/" } // fallback to 46019 page
];

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
};

function fetchUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { headers, timeout: 10000 }, (res) => {
      if (res.statusCode !== 200) {
        resolve('');
        return;
      }
      let data = '';
      res.on('data', (chunk) => data += chunk);
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

async function run() {
  for (const target of targets) {
    console.log(`Fetching correct casing for ${target.article} from: ${target.url}`);
    const html = await fetchUrl(target.url);
    if (!html) {
      console.log(`  ❌ Failed to fetch page.`);
      continue;
    }
    
    const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/gi;
    let match;
    const candidates = [];
    while ((match = imgRegex.exec(html)) !== null) {
      const src = match[1];
      const fullSrc = urlModule.resolve(target.url, src);
      
      const lowerSrc = fullSrc.toLowerCase();
      // Filter out ink pads and accessory keywords
      if (
        lowerSrc.includes('/upload/') &&
        !lowerSrc.includes('logo') &&
        !lowerSrc.includes('icon') &&
        !lowerSrc.includes('flag') &&
        !lowerSrc.includes('podush') && // ink pad
        !lowerSrc.includes('pad') &&
        !lowerSrc.includes('krask') && // ink
        !lowerSrc.includes('refill') &&
        !lowerSrc.includes('cartridge')
      ) {
        candidates.push(fullSrc);
      }
    }
    
    let bestImg = null;
    let bestScore = -100;
    for (const img of candidates) {
      let score = 0;
      if (img.includes(target.article)) score += 50;
      if (img.includes('/iblock/')) score += 30;
      if (img.includes('detail') || img.includes('photo') || img.includes('casing') || img.includes('osnastka')) score += 20;
      if (score > bestScore) {
        bestScore = score;
        bestImg = img;
      }
    }
    
    if (bestImg) {
      console.log(`  Found best casing image: ${bestImg} (Score: ${bestScore})`);
      const destPath = path.join(destDir, `${target.article}.jpg`);
      const tempPath = path.join(destDir, `${target.article}_temp_casing.jpg`);
      
      try {
        await downloadImage(bestImg, tempPath);
        const stats = fs.statSync(tempPath);
        if (stats.size > 10000) {
          if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
          fs.renameSync(tempPath, destPath);
          console.log(`  ✅ SUCCESS: Overwrote with correct casing (${Math.round(stats.size/1024)} KB)`);
        } else {
          console.log(`  ❌ Image too small, skipping.`);
          if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        }
      } catch (err) {
        console.log(`  ❌ Download failed: ${err.message}`);
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      }
    } else {
      console.log(`  ❌ No suitable casing image found on page.`);
    }
  }
}

run();
