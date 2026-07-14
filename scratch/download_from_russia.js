const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');
const urlModule = require('url');

const destDir = "C:/Users/User/Desktop/Project/react/public/images/stamps";

const remainingStamps = [
  { "article": "4922", "name": "Trodat Printy 4922 Square", "series": "printy" },
  { "article": "46025", "name": "Trodat Printy 46025 Round", "series": "printy" },
  { "article": "46030", "name": "Trodat Printy 46030 Round", "series": "printy" },
  { "article": "46040", "name": "Trodat Printy 46040 Round", "series": "printy" },
  { "article": "4642", "name": "Trodat Printy 4642 Round", "series": "printy" },
  { "article": "4928", "name": "Trodat Printy 4928", "series": "printy" },
  { "article": "4929", "name": "Trodat Printy 4929", "series": "printy" },
  { "article": "5203", "name": "Trodat Professional 5203", "series": "professional" },
  { "article": "9411", "name": "Trodat Mobile Printy 9411", "series": "mobile" },
  { "article": "9413", "name": "Trodat Mobile Printy 9413", "series": "mobile" },
  { "article": "9425", "name": "Trodat Mobile Printy 9425 Square", "series": "mobile" },
  { "article": "Ideal Seal", "name": "Trodat Ideal Seal", "series": "ideal" },
  { "article": "4810", "name": "Trodat Printy 4810 Dater", "series": "printy" },
  { "article": "4820", "name": "Trodat Printy 4820 Dater", "series": "printy" },
  { "article": "4836", "name": "Trodat Printy 4836 Numerator", "series": "printy" },
  { "article": "4846", "name": "Trodat Printy 4846 Numerator", "series": "printy" },
  { "article": "9342", "name": "Trodat Micro Printy 9342", "series": "mobile" },
  { "article": "9052", "name": "Trodat Stamp Pad 9052", "series": "accessories" },
  { "article": "46042", "name": "Trodat Ideal 46042", "series": "ideal" },
  { "article": "46050", "name": "Trodat Printy 46050", "series": "printy" },
  { "article": "4612", "name": "Trodat Printy 4612", "series": "printy" },
  { "article": "46140", "name": "Trodat Printy 46140", "series": "printy" },
  { "article": "46145", "name": "Trodat Printy 46145", "series": "printy" },
  { "article": "4645", "name": "Trodat Printy 4645", "series": "printy" },
  { "article": "4724", "name": "Trodat Printy 4724", "series": "printy" },
  { "article": "4817", "name": "Trodat Printy 4817", "series": "printy" },
  { "article": "4822", "name": "Trodat Printy 4822 Dater", "series": "printy" },
  { "article": "4908", "name": "Trodat Printy 4908", "series": "printy" },
  { "article": "4931", "name": "Trodat Printy 4931", "series": "printy" },
  { "article": "4940", "name": "Trodat Professional 4940 Dater", "series": "professional" },
  { "article": "52040", "name": "Trodat Professional 52040", "series": "professional" },
  { "article": "52045", "name": "Trodat Professional 52045", "series": "professional" },
  { "article": "52140", "name": "Trodat Professional 52140 Dater", "series": "professional" },
  { "article": "5253", "name": "Trodat Professional 5253 Dater", "series": "professional" },
  { "article": "54045", "name": "Trodat Professional 54045 Dater", "series": "professional" },
  { "article": "54110", "name": "Trodat Professional 54110", "series": "professional" },
  { "article": "54510", "name": "Trodat Professional 54510", "series": "professional" },
  { "article": "5465", "name": "Trodat Professional 5465 Dater", "series": "professional" },
  { "article": "5474", "name": "Trodat Professional 5474", "series": "professional" },
  { "article": "5485", "name": "Trodat Professional 5485", "series": "professional" },
  { "article": "5546", "name": "Trodat Professional 5546 Dater", "series": "professional" },
  { "article": "55510", "name": "Trodat Professional 55510 Dater", "series": "professional" },
  { "article": "5558", "name": "Trodat Professional 5558 Dater", "series": "professional" },
  { "article": "5756", "name": "Trodat Professional 5756 Dater", "series": "professional" },
  { "article": "9051", "name": "Trodat Accessories 9051", "series": "accessories" },
  { "article": "9053", "name": "Trodat Accessories 9053", "series": "accessories" },
  { "article": "9430", "name": "Trodat Mobile Printy 9430", "series": "mobile" },
  { "article": "9500", "name": "Trodat Ideal 9500", "series": "ideal" },
  { "article": "9512", "name": "Trodat Pocket Printy 9512", "series": "mobile" },
  { "article": "9515", "name": "Trodat Pocket Printy 9515", "series": "mobile" }
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

// Custom manual mappings or corrections for articles that don't match the standard naming
const manualMap = {
  "46030": "https://trodat-russia.ru/catalog/printy/kruglye-pechati/4630/", // 46030 corresponds to 4630 on Russian site
  "46040": "https://trodat-russia.ru/catalog/printy/kruglye-pechati/46040/",
  "4928": "https://trodat-russia.ru/catalog/printy/tekstovye-shtampy/4928/",
  "Ideal Seal": "https://trodat-russia.ru/catalog/ideal/ideal-seal/",
  "9413": "https://trodat-russia.ru/catalog/mobilnye-shtampy/micro-printy/9342/", // fallback micro printy
  "9425": "https://trodat-russia.ru/catalog/mobilnye-shtampy/micro-printy/9342/",
  "9430": "https://trodat-russia.ru/catalog/mobilnye-shtampy/micro-printy/9342/",
  "9512": "https://trodat-russia.ru/catalog/mobilnye-shtampy/pocket-printy-pocket/9512/",
  "9515": "https://trodat-russia.ru/catalog/mobilnye-shtampy/pocket-printy-pocket/9511/" // fallback to 9511 casing
};

// Load crawled URLs JSON
let crawledUrls = {};
try {
  crawledUrls = JSON.parse(fs.readFileSync('C:/Users/User/Desktop/Project/react/scratch/russia_product_urls.json', 'utf8'));
} catch (e) {}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  let successCount = 0;
  
  for (let i = 0; i < remainingStamps.length; i++) {
    const stamp = remainingStamps[i];
    let url = manualMap[stamp.article] || crawledUrls[stamp.article];
    
    if (!url) {
      // Guess standard categories
      if (stamp.series === 'printy') {
        url = `https://trodat-russia.ru/catalog/printy/tekstovye-shtampy/${stamp.article}/`;
      } else if (stamp.series === 'professional') {
        url = `https://trodat-russia.ru/catalog/professional/pechati-i-shtampy-so-svobodnym-polem/${stamp.article}/`;
      } else if (stamp.series === 'mobile') {
        url = `https://trodat-russia.ru/catalog/mobilnye-shtampy/micro-printy/${stamp.article}/`;
      }
    }
    
    if (!url) {
      console.log(`[${i+1}/${remainingStamps.length}] No page URL for ${stamp.article}`);
      continue;
    }
    
    console.log(`[${i+1}/${remainingStamps.length}] Fetching ${stamp.article} from page: ${url}`);
    const html = await fetchUrl(url);
    if (!html) {
      console.log(`  ❌ Failed to fetch page html.`);
      continue;
    }
    
    // Find image URLs
    const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/gi;
    let match;
    const candidates = [];
    while ((match = imgRegex.exec(html)) !== null) {
      const src = match[1];
      const fullSrc = urlModule.resolve(url, src);
      if (fullSrc.includes('/upload/') && !fullSrc.includes('logo') && !fullSrc.includes('icon') && !fullSrc.includes('flag')) {
        candidates.push(fullSrc);
      }
    }
    
    // Score images to find the best casing image
    let bestImg = null;
    let bestScore = -100;
    
    for (const img of candidates) {
      let score = 0;
      if (img.includes(stamp.article)) score += 50;
      if (img.includes('/iblock/')) score += 30; // standard product image storage in Bitrix CMS
      if (img.includes('detail') || img.includes('photo')) score += 20;
      if (score > bestScore) {
        bestScore = score;
        bestImg = img;
      }
    }
    
    if (bestImg) {
      console.log(`  Found best image: ${bestImg} (Score: ${bestScore})`);
      const filePath = path.join(destDir, `${stamp.article}.jpg`);
      const tempPath = path.join(destDir, `${stamp.article}_temp.jpg`);
      
      try {
        await downloadImage(bestImg, tempPath);
        const stats = fs.statSync(tempPath);
        if (stats.size > 10000) {
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
          fs.renameSync(tempPath, filePath);
          console.log(`  ✅ SUCCESS: Downloaded high-res image (${Math.round(stats.size/1024)} KB)`);
          successCount++;
        } else {
          console.log(`  ❌ Image too small (${Math.round(stats.size/1024)} KB), skipping.`);
          if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        }
      } catch (err) {
        console.log(`  ❌ Download error: ${err.message}`);
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      }
    } else {
      console.log(`  ❌ No product image found in HTML.`);
    }
    
    await sleep(400); // polite delay
  }
  
  console.log(`\n=== Russia Downloader Completed ===`);
  console.log(`Successfully Downloaded: ${successCount} / ${remainingStamps.length}`);
}

main();
