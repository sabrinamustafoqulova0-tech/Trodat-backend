/**
 * Try to fetch larger images for remaining problematic stamps from alternative sources:
 * - thestampmaker.com with round/square naming variants
 * - simplystamps.com  
 * - Also try the high-res iblock direct URLs from trodat-russia.ru
 */
const fs = require('fs');
const https = require('https');
const path = require('path');

const destDir = "C:/Users/User/Desktop/Project/react/public/images/stamps";

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
  'Referer': 'https://www.thestampmaker.com/'
};

const candidateSets = {
  "46040": [
    "https://www.thestampmaker.com/images/products/trodat-printy-46040.jpg",
    "https://cdn.simplystamps.com/media/catalog/product/t/r/trodat-46040.jpg",
    "https://www.thestampmaker.com/images/products/trodat-printy-4640.jpg",
    "https://rubberstamps.net/media/catalog/product/t/r/trodat-4640_1.jpg",
    // trodat-russia.ru with larger cache
    "https://trodat-russia.ru/upload/resize_cache/iblock/c3d/600_600_1/c3dd8f94ba758008cf760e9578fc4c78.png"
  ],
  "46050": [
    "https://www.thestampmaker.com/images/products/trodat-printy-46050.jpg",
    "https://cdn.simplystamps.com/media/catalog/product/t/r/trodat-46050.jpg",
    "https://rubberstamps.net/media/catalog/product/t/r/trodat-4650_1.jpg"
  ],
  "46140": [
    "https://www.thestampmaker.com/images/products/trodat-printy-46140.jpg",
    "https://cdn.simplystamps.com/media/catalog/product/t/r/trodat-46140.jpg",
    "https://rubberstamps.net/media/catalog/product/t/r/trodat-46140_1.jpg",
    // trodat-russia full iblock
    "https://trodat-russia.ru/upload/iblock/481/481aa4ef15dce59bdd440bc790c8aaac.jpg"
  ],
  "54045": [
    "https://www.thestampmaker.com/images/products/trodat-professional-54045.jpg",
    "https://www.thestampmaker.com/images/products/trodat-54045.jpg",
    "https://cdn.simplystamps.com/media/catalog/product/t/r/trodat-54045.jpg",
    "https://rubberstamps.net/media/catalog/product/t/r/trodat-54045_1.jpg",
    // trodat-russia full iblock 
    "https://trodat-russia.ru/upload/iblock/c3b/54045.png"
  ],
  "5474": [
    "https://www.thestampmaker.com/images/products/trodat-professional-5474.jpg",
    "https://www.thestampmaker.com/images/products/trodat-5474.jpg",
    "https://cdn.simplystamps.com/media/catalog/product/t/r/trodat-5474.jpg",
    "https://rubberstamps.net/media/catalog/product/t/r/trodat-5474_1.jpg",
    // trodat-russia full iblock
    "https://trodat-russia.ru/upload/iblock/80d/5474.png"
  ]
};

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const req = https.get(url, { headers, timeout: 12000 }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        // Follow redirect
        downloadImage(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        reject(new Error(`Status ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    });
    req.on('error', err => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });
    req.on('timeout', () => {
      req.destroy();
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(new Error('Timeout'));
    });
  });
}

function getJpegDimensions(buffer) {
  let i = 2;
  while (i < buffer.length - 4) {
    if (buffer[i] !== 0xFF) { i++; continue; }
    const marker = buffer[i + 1];
    if (marker === 0xD9 || marker === 0xDA) break;
    if ([0xC0,0xC1,0xC2,0xC3,0xC5,0xC6,0xC7,0xC9,0xCA,0xCB,0xCD,0xCE,0xCF].includes(marker)) {
      try { return { height: buffer.readUInt16BE(i+5), width: buffer.readUInt16BE(i+7) }; }
      catch { return null; }
    }
    if (i + 3 >= buffer.length) break;
    const length = buffer.readUInt16BE(i + 2);
    if (length < 2) break;
    i += 2 + length;
  }
  return null;
}

function getPngDimensions(buffer) {
  if (buffer.length > 24 && buffer.readUInt32BE(12) === 0x49484452) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  return null;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function run() {
  let fixed = 0;
  
  for (const [article, candidates] of Object.entries(candidateSets)) {
    const destPath = path.join(destDir, `${article}.jpg`);
    const tempPath = path.join(destDir, `${article}_try.jpg`);
    let succeeded = false;
    
    for (const url of candidates) {
      console.log(`[${article}] Trying: ${url}`);
      try {
        await downloadImage(url, tempPath);
        const stats = fs.statSync(tempPath);
        const buffer = fs.readFileSync(tempPath);
        
        let dims = null;
        if (buffer[0] === 0xFF && buffer[1] === 0xD8) dims = getJpegDimensions(buffer);
        else if (buffer[0] === 0x89 && buffer[1] === 0x50) dims = getPngDimensions(buffer);
        
        const sizekb = Math.round(stats.size / 1024);
        const dimStr = dims ? `${dims.width}x${dims.height}` : 'unknown';
        
        const meetsThreshold = stats.size > 20000 && dims && dims.width >= 350 && dims.height >= 350;
        
        console.log(`  → ${sizekb} KB | ${dimStr} | ${meetsThreshold ? '✅ GOOD' : '⚠️ still low'}`);
        
        if (meetsThreshold) {
          if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
          fs.renameSync(tempPath, destPath);
          succeeded = true;
          fixed++;
          break;
        } else {
          if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        }
      } catch (e) {
        console.log(`  → Error: ${e.message}`);
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      }
      await sleep(300);
    }
    
    if (!succeeded) {
      console.log(`  ❌ [${article}] Could not find adequate image from any source.`);
    }
  }
  
  console.log(`\nFixed ${fixed} / ${Object.keys(candidateSets).length} stamps.`);
}

run();
