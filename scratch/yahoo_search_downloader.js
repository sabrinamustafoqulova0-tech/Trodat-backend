const fs = require('fs');
const https = require('https');
const path = require('path');
const urlModule = require('url');

const seedPath = "C:/Users/User/Desktop/Project/backend/prisma/seed.ts";
const destDir = "C:/Users/User/Desktop/Project/react/public/images/stamps";

const http = require('http');

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function fetchUrl(url, timeoutMs = 10000) {
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

// Filter to missing or low-res (< 10KB)
const missingStamps = stamps.filter(stamp => {
  const filePath = path.join(destDir, `${stamp.article}.jpg`);
  if (!fs.existsSync(filePath)) return true;
  const stats = fs.statSync(filePath);
  return stats.size < 10000;
});

console.log(`Need to find high-res images for ${missingStamps.length} stamps.`);

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
              dec.includes('simplystamps.com') || 
              dec.includes('thestampmaker.com') || 
              dec.includes('trodat.net') || 
              dec.includes('rubberstamps.net') || 
              dec.includes('rubberstampchamp.com') || 
              dec.includes('stamp-connection.com') || 
              dec.includes('rubberstamps.com')
            ) {
              links.push(dec);
            }
          } catch (e) {}
        }
      }
    }
    const distLinks = links.filter(l => !l.includes('trodat.net'));
    if (distLinks.length >= 2) {
      break;
    }
    await sleep(1000);
  }

  return [...new Set(links)];
}

function scoreImageUrl(imgUrl, stamp) {
  const urlLower = imgUrl.toLowerCase();
  const art = stamp.article.toLowerCase();
  const nameParts = stamp.name.toLowerCase().split(' ');

  let score = 0;

  // Boost if contains article number
  if (urlLower.includes(art)) {
    score += 50;
  }

  // Boost if contains stamp name parts
  for (const part of nameParts) {
    if (part.length > 2 && urlLower.includes(part)) {
      score += 10;
    }
  }

  // Boost popular stamp websites
  if (urlLower.includes('thestampmaker.com')) score += 30;
  if (urlLower.includes('simplystamps.com')) score += 35;
  if (urlLower.includes('rubberstamps.net')) score += 25;
  if (urlLower.includes('rubberstampchamp.com')) score += 25;
  if (urlLower.includes('trodat.net')) score += 40;
  if (urlLower.includes('trodat-russia.ru')) score += 20;

  // Penalize icons / layout elements
  if (urlLower.includes('logo')) score -= 100;
  if (urlLower.includes('icon')) score -= 80;
  if (urlLower.includes('banner')) score -= 70;
  if (urlLower.includes('header')) score -= 60;
  if (urlLower.includes('footer')) score -= 60;
  if (urlLower.includes('star')) score -= 50;
  if (urlLower.includes('rating')) score -= 50;
  if (urlLower.includes('button')) score -= 60;
  if (urlLower.includes('cart')) score -= 40;
  if (urlLower.includes('preview')) score -= 10;
  if (urlLower.includes('avatar')) score -= 80;
  if (urlLower.includes('placeholder')) score -= 90;

  // Penalize non-product formats (e.g. impressions/designs if we want the actual stamp body)
  if (urlLower.includes('impression') || urlLower.includes('imprint') || urlLower.includes('template')) {
    score -= 15;
  }

  return score;
}

async function processStamp(stamp, index) {
  console.log(`\n[${index}/${missingStamps.length}] Processing ${stamp.article} (${stamp.name})...`);
  
  const links = await getImagesFromYahoo(stamp);
  console.log(`  Found Yahoo target links:`, links.slice(0, 3));
  
  const candidateImages = new Set();

  // Fetch product pages and extract images
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
    await sleep(1000); // polite delay
  }

  // Score candidates
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
    console.log(`  Found best image: ${bestUrl} (Score: ${scored[0].score})`);
    
    // Save to dest
    const filePath = path.join(destDir, `${stamp.article}.jpg`);
    try {
      await downloadImage(bestUrl, filePath);
      console.log(`  ✅ SUCCESS: Downloaded image for ${stamp.article}`);
      return true;
    } catch (err) {
      console.error(`  ❌ FAILED to download image from ${bestUrl}: ${err.message}`);
    }
  } else {
    console.log(`  ❌ No high-scoring image candidate found.`);
  }
  return false;
}

async function run() {
  let successCount = 0;
  for (let i = 0; i < missingStamps.length; i++) {
    const success = await processStamp(missingStamps[i], i + 1);
    if (success) successCount++;
    await sleep(2500); // 2.5s polite delay between searches
  }
  console.log(`\n=== Yahoo Crawler Summary ===`);
  console.log(`Processed: ${missingStamps.length}`);
  console.log(`Successfully Downloaded: ${successCount}`);
}

run();
