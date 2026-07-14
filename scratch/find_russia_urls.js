const fs = require('fs');
const https = require('https');
const urlModule = require('url');

const remainingStamps = [
  { "article": "46040", "name": "Trodat Printy 46040 Round" },
  { "article": "4928", "name": "Trodat Printy 4928" },
  { "article": "9411", "name": "Trodat Mobile Printy 9411" },
  { "article": "Ideal Seal", "name": "Trodat Ideal Seal" },
  { "article": "4836", "name": "Trodat Printy 4836 Numerator" },
  { "article": "4846", "name": "Trodat Printy 4846 Numerator" },
  { "article": "46042", "name": "Trodat Ideal 46042" },
  { "article": "4908", "name": "Trodat Printy 4908" },
  { "article": "4940", "name": "Trodat Professional 4940 Dater" },
  { "article": "52040", "name": "Trodat Professional 52040" },
  { "article": "52140", "name": "Trodat Professional 52140 Dater" },
  { "article": "5253", "name": "Trodat Professional 5253 Dater" },
  { "article": "54110", "name": "Trodat Professional 54110" },
  { "article": "54510", "name": "Trodat Professional 54510" },
  { "article": "5465", "name": "Trodat Professional 5465 Dater" },
  { "article": "5485", "name": "Trodat Professional 5485" },
  { "article": "55510", "name": "Trodat Professional 55510 Dater" },
  { "article": "5558", "name": "Trodat Professional 5558 Dater" },
  { "article": "5756", "name": "Trodat Professional 5756 Dater" },
  { "article": "9500", "name": "Trodat Ideal 9500" },
  { "article": "9512", "name": "Trodat Pocket Printy 9512" },
  { "article": "9515", "name": "Trodat Pocket Printy 9515" }
];

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
};

function fetchUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { headers, timeout: 8000 }, (res) => {
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

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  const results = {};
  
  for (let i = 0; i < remainingStamps.length; i++) {
    const stamp = remainingStamps[i];
    const query = `site:trodat-russia.ru ${stamp.name}`;
    const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    
    console.log(`[${i+1}/${remainingStamps.length}] Searching DDG for: ${query}`);
    const searchHtml = await fetchUrl(searchUrl);
    
    if (!searchHtml) {
      console.log(`  ❌ Failed to search DDG.`);
      await sleep(1500);
      continue;
    }
    
    // Extract links
    const linkRegex = /<a class="result__snippet"[^>]*href="([^"]+)"/gi;
    let match;
    let foundUrl = null;
    
    while ((match = linkRegex.exec(searchHtml)) !== null) {
      let link = match[1];
      if (link.includes('uddg=')) {
        link = decodeURIComponent(link.split('uddg=')[1].split('&')[0]);
      }
      if (link.includes('trodat-russia.ru/catalog/')) {
        foundUrl = link;
        break;
      }
    }
    
    if (foundUrl) {
      console.log(`  ✅ Found URL: ${foundUrl}`);
      results[stamp.article] = foundUrl;
    } else {
      console.log(`  ❌ No trodat-russia.ru catalog URL found in snippets.`);
    }
    
    await sleep(1500); // polite delay
  }
  
  console.log('\n=== Discovery Complete ===');
  console.log(JSON.stringify(results, null, 2));
  
  // Merge with existing russia_product_urls.json
  const cachePath = 'C:/Users/User/Desktop/Project/react/scratch/russia_product_urls.json';
  let existing = {};
  try {
    existing = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  } catch (e) {}
  
  const merged = { ...existing, ...results };
  fs.writeFileSync(cachePath, JSON.stringify(merged, null, 2));
  console.log(`Merged and saved to ${cachePath}`);
}

run();
