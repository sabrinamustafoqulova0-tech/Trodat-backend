const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');
const urlModule = require('url');

const seedPath = "C:/Users/User/Desktop/Project/backend/prisma/seed.ts";
const destDir = "C:/Users/User/Desktop/Project/react/public/images/stamps";

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function fetchUrl(url, timeoutMs = 12000) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { headers, timeout: timeoutMs }, (res) => {
      if (res.statusCode !== 200) {
        resolve('');
        return;
      }
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''))
      .on('timeout', () => resolve(''));
  });
}

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;
    client.get(url, { headers, timeout: 15000 }, (res) => {
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
  if (!fs.existsSync(filePath)) return true;
  
  const stats = fs.statSync(filePath);
  if (stats.size < 12000) return true; // file size < 12KB is definitely low res
  
  const buffer = fs.readFileSync(filePath);
  let dims = null;
  if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
    dims = getJpegDimensions(buffer);
  } else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    dims = getPngDimensions(buffer);
  }
  
  if (!dims) return false; // if we can't parse dims but size >= 12KB, assume ok
  if (dims.width < 350 || dims.height < 350) return true; // dimension too small
  return false;
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

// Filter to missing or low-res
const targetStamps = stamps.filter(stamp => checkNeedsHighRes(stamp.article));

console.log(`Need to find high-res images for ${targetStamps.length} stamps out of ${stamps.length} total.`);

async function getImagesFromYahoo(stamp) {
  const queries = [
    `${stamp.name} stamp`,
    `${stamp.name} site:simplystamps.com`,
    `${stamp.name} site:thestampmaker.com`,
    `Trodat ${stamp.article} site:rubberstamps.net`
  ];
  
  const links = [];
  
  for (const query of queries) {
    const searchUrl = `https://search.yahoo.com/search?p=${encodeURIComponent(query)}`;
    const searchHtml = await fetchUrl(searchUrl);
    if (!searchHtml) continue;

    const hrefRegex = /href="([^"]+)"/gi;
    let hrefMatch;
    while ((hrefMatch = hrefRegex.exec(searchHtml)) !== null) {
      let href = hrefMatch[1];
      if (href.includes('RU=')) {
        const parts = href.split('RU=');
        if (parts.length > 1) {
          const rawUrl = parts[1].split('/RK=')[0];
          try {
            const dec = decodeURIComponent(rawUrl);
            if (
              !dec.includes('yahoo.com') &&
              !dec.includes('google.com') &&
              !dec.includes('bing.com') &&
              !dec.includes('yandex') &&
              !dec.includes('pinterest.com')
            ) {
              links.push(dec);
            }
          } catch (e) {}
        }
      }
    }
    const distLinks = links.filter(l => 
      l.includes('simplystamps.com') || 
      l.includes('thestampmaker.com') || 
      l.includes('rubberstamp') || 
      l.includes('stamp-connection')
    );
    if (distLinks.length >= 2) break;
    await sleep(800);
  }

  return [...new Set(links)];
}

function scoreImageUrl(imgUrl, stamp) {
  const urlLower = imgUrl.toLowerCase();
  const art = stamp.article.toLowerCase();
  const nameParts = stamp.name.toLowerCase().split(' ');

  let score = 0;

  if (urlLower.includes(art)) {
    score += 60;
  }

  for (const part of nameParts) {
    if (part.length > 2 && urlLower.includes(part)) {
      score += 15;
    }
  }

  if (urlLower.includes('thestampmaker.com')) score += 30;
  if (urlLower.includes('simplystamps.com')) score += 35;
  if (urlLower.includes('rubberstamps.net')) score += 25;
  if (urlLower.includes('rubberstampchamp.com')) score += 25;
  if (urlLower.includes('trodat.net')) score += 40;

  if (urlLower.includes('logo')) score -= 100;
  if (urlLower.includes('icon')) score -= 80;
  if (urlLower.includes('banner')) score -= 70;
  if (urlLower.includes('header')) score -= 60;
  if (urlLower.includes('footer')) score -= 60;
  if (urlLower.includes('star')) score -= 50;
  if (urlLower.includes('rating')) score -= 50;
  if (urlLower.includes('button')) score -= 60;
  if (urlLower.includes('cart')) score -= 40;
  if (urlLower.includes('avatar')) score -= 80;
  if (urlLower.includes('placeholder')) score -= 90;
  if (urlLower.includes('impression') || urlLower.includes('imprint') || urlLower.includes('template')) {
    score -= 20;
  }

  return score;
}

async function processStamp(stamp, index) {
  console.log(`\n[${index}/${targetStamps.length}] Processing ${stamp.article} (${stamp.name})...`);
  
  const links = await getImagesFromYahoo(stamp);
  const candidateImages = new Set();

  for (const link of links.slice(0, 3)) {
    console.log(`  Fetching page: ${link}`);
    const pageHtml = await fetchUrl(link);
    if (!pageHtml) continue;

    const imgRegex = /<img[^>]+src="([^"]+)"/gi;
    let match;
    while ((match = imgRegex.exec(pageHtml)) !== null) {
      try {
        const fullSrc = urlModule.resolve(link, match[1]);
        candidateImages.add(fullSrc);
      } catch (e) {}
    }
    await sleep(800);
  }

  const scored = [];
  for (const imgUrl of candidateImages) {
    if (/\.(?:jpg|png|jpeg|webp)/i.test(imgUrl)) {
      const score = scoreImageUrl(imgUrl, stamp);
      scored.push({ url: imgUrl, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  if (scored.length > 0 && scored[0].score > 15) {
    const bestUrl = scored[0].url;
    console.log(`  Found best image candidate: ${bestUrl} (Score: ${scored[0].score})`);
    
    const filePath = path.join(destDir, `${stamp.article}.jpg`);
    const tempPath = path.join(destDir, `${stamp.article}_temp.jpg`);
    
    try {
      await downloadImage(bestUrl, tempPath);
      
      // Verify the downloaded file size
      const stats = fs.statSync(tempPath);
      if (stats.size > 10000) {
        // If it's a good high-res file, overwrite the old one
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        fs.renameSync(tempPath, filePath);
        console.log(`  ✅ SUCCESS: Downloaded high-res image for ${stamp.article} (${Math.round(stats.size/1024)} KB)`);
        return true;
      } else {
        console.log(`  ❌ Temp download was too small (${Math.round(stats.size/1024)} KB), keeping previous file.`);
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      }
    } catch (err) {
      console.error(`  ❌ FAILED to download image: ${err.message}`);
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
  } else {
    console.log(`  ❌ No high-scoring image candidate found.`);
  }
  return false;
}

async function run() {
  let successCount = 0;
  for (let i = 0; i < targetStamps.length; i++) {
    const success = await processStamp(targetStamps[i], i + 1);
    if (success) successCount++;
    await sleep(2000);
  }
  console.log(`\n=== Downloader Summary ===`);
  console.log(`Processed: ${targetStamps.length}`);
  console.log(`Successfully Updated to High-Res: ${successCount}`);
}

run();
