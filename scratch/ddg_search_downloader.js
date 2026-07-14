const fs = require('fs');
const https = require('https');
const path = require('path');
const urlModule = require('url');

const seedPath = "C:/Users/User/Desktop/Project/backend/prisma/seed.ts";
const destDir = "C:/Users/User/Desktop/Project/react/public/images/stamps";

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function fetchUrl(url, timeoutMs = 8000) {
  return new Promise((resolve) => {
    const req = https.get(url, { headers, timeout: timeoutMs }, (res) => {
      if (res.statusCode !== 200) {
        resolve('');
        return;
      }
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', () => resolve(''));
    req.on('timeout', () => {
      req.destroy();
      resolve('');
    });
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

async function getImagesFromDDG(stamp) {
  // Search query
  const query = `${stamp.name} stamp`;
  const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const searchHtml = await fetchUrl(searchUrl);
  if (!searchHtml) return { links: [], directUrls: [] };

  // Extract result page URLs
  const linkRegex = /<a class="result__snippet"[^>]*href="([^"]+)"/gi;
  const links = [];
  let linkMatch;
  while ((linkMatch = linkRegex.exec(searchHtml)) !== null) {
    let link = linkMatch[1];
    if (link.includes('uddg=')) {
      link = decodeURIComponent(link.split('uddg=')[1].split('&')[0]);
    }
    // Skip some generic/social sites
    if (!link.includes('youtube.com') && !link.includes('pinterest.com') && !link.includes('facebook.com') && !link.includes('instagram.com')) {
      links.push(link);
    }
  }

  // Also extract any potential direct image URLs from search snippets
  const imgUrlRegex = /https?:\/\/[^\s"'<>\(\)]+?\.(?:jpg|png|jpeg|webp)/gi;
  const directUrls = [];
  let imgMatch;
  while ((imgMatch = imgUrlRegex.exec(searchHtml)) !== null) {
    directUrls.push(imgMatch[0]);
  }

  return { links: links.slice(0, 3), directUrls };
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
  
  const { links, directUrls } = await getImagesFromDDG(stamp);
  
  const candidateImages = new Set();
  
  // Add direct URLs from snippets
  for (const u of directUrls) {
    candidateImages.add(u);
  }

  // Fetch product pages and extract images
  for (const link of links) {
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
    await sleep(500); // polite delay
  }

  // Score candidates
  const scored = [];
  for (const imgUrl of candidateImages) {
    // Basic filter for image files
    if (/\.(?:jpg|png|jpeg|webp)/i.test(imgUrl)) {
      const score = scoreImageUrl(imgUrl, stamp);
      scored.push({ url: imgUrl, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);

  if (scored.length > 0 && scored[0].score > 20) {
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
    await sleep(2000); // 2s polite delay between searches
  }
  console.log(`\n=== Crawler Summary ===`);
  console.log(`Processed: ${missingStamps.length}`);
  console.log(`Successfully Downloaded: ${successCount}`);
}

run();
