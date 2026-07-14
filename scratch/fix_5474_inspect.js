/**
 * Fetch the correct 5474 dater image from trodat-russia.ru product page
 * 5474 is a Professional dater stamp - need the casing image not the ink pad
 */
const fs = require('fs');
const https = require('https');
const path = require('path');
const urlModule = require('url');

const destDir = "C:/Users/User/Desktop/Project/react/public/images/stamps";

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/119.0.0.0 Safari/537.36'
};

function fetchUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { headers, timeout: 10000 }, (res) => {
      if (res.statusCode !== 200) { resolve(''); return; }
      let data = '';
      res.on('data', c => data += c);
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

async function run() {
  const url = 'https://trodat-russia.ru/catalog/professional/datery-so-svobodnym-polem-datery/5474/';
  console.log('Fetching page:', url);
  const html = await fetchUrl(url);
  if (!html) { console.log('No HTML'); return; }

  // Find ALL /upload/ images and print them
  const re = /<img[^>]+src="([^"]+)"[^>]*>/gi;
  let m;
  const imgs = [];
  while ((m = re.exec(html)) !== null) {
    const src = m[1];
    const full = urlModule.resolve(url, src);
    if (full.includes('/upload/')) {
      imgs.push({ full, context: m[0].substring(0, 200) });
    }
  }
  
  console.log(`Found ${imgs.length} /upload/ images:`);
  imgs.forEach((img, i) => console.log(`  [${i}] ${img.full}`));

  // Pick the one most likely to be the stamp casing (NOT ink pad)
  // Ink pads are usually in 'podushki' or named 'pad' or resemble the accessory  
  // The 5474 product img should mention the product number or be in /iblock/
  const bestCandidates = imgs.filter(img => {
    const l = img.full.toLowerCase();
    return !l.includes('podush') && !l.includes('pad') && !l.includes('krask');
  });
  
  console.log(`\nFiltered to ${bestCandidates.length} non-pad candidates.`);
  
  if (bestCandidates.length === 0) { console.log('No candidates!'); return; }
  
  // Sort: direct iblock (no resize) first → bigger
  bestCandidates.sort((a,b) => {
    const aFull = !a.full.includes('resize_cache') ? 1 : 0;
    const bFull = !b.full.includes('resize_cache') ? 1 : 0;
    const aArt = a.full.includes('5474') ? 1 : 0;
    const bArt = b.full.includes('5474') ? 1 : 0;
    return (bFull + bArt) - (aFull + aArt);
  });
  
  for (const cand of bestCandidates) {
    console.log(`\nTrying: ${cand.full}`);
    const temp = path.join(destDir, '5474_new.jpg');
    try {
      await downloadImage(cand.full, temp);
      const stats = fs.statSync(temp);
      console.log(`  Downloaded: ${Math.round(stats.size/1024)} KB`);
      
      if (stats.size > 20000) {
        const dest = path.join(destDir, '5474.jpg');
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        fs.renameSync(temp, dest);
        console.log(`  ✅ Saved as 5474.jpg`);
        break;
      } else {
        console.log(`  Too small, trying next.`);
        if (fs.existsSync(temp)) fs.unlinkSync(temp);
      }
    } catch(e) {
      console.log(`  Error: ${e.message}`);
      if (fs.existsSync(temp)) fs.unlinkSync(temp);
    }
  }
}

run();
