const fs = require('fs');
const https = require('https');
const urlModule = require('url');

const categories = [
  "https://trodat-russia.ru/catalog/printy/kruglye-pechati/",
  "https://trodat-russia.ru/catalog/printy/tekstovye-shtampy/",
  "https://trodat-russia.ru/catalog/printy/datery/",
  "https://trodat-russia.ru/catalog/printy/datery-so-svobodnym-polem/",
  "https://trodat-russia.ru/catalog/professional/pechati-i-shtampy-so-svobodnym-polem/",
  "https://trodat-russia.ru/catalog/professional/datery-so-svobodnym-polem-datery/",
  "https://trodat-russia.ru/catalog/professional/numeratory/",
  "https://trodat-russia.ru/catalog/mobilnye-shtampy/micro-printy/",
  "https://trodat-russia.ru/catalog/mobilnye-shtampy/pocket-printy-pocket/",
  "https://trodat-russia.ru/catalog/ideal/tekstovye-shtampy-i-kruglye-pechati/",
  "https://trodat-russia.ru/catalog/ideal/ideal-seal/",
  "https://trodat-russia.ru/catalog/aksessuary/shtempelnye-podushki/"
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

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  const discoveredUrls = {};
  
  for (const cat of categories) {
    // Check pages 1 and 2
    for (let page = 1; page <= 3; page++) {
      const url = page === 1 ? cat : `${cat}?PAGEN_1=${page}`;
      console.log(`Fetching category page: ${url}`);
      
      const html = await fetchUrl(url);
      if (!html) continue;
      
      const hrefRegex = /href="([^"]+)"/gi;
      let match;
      while ((match = hrefRegex.exec(html)) !== null) {
        let href = match[1];
        const fullHref = urlModule.resolve(url, href);
        const parsed = urlModule.parse(fullHref);
        let path = parsed.path || '';
        if (!path.endsWith('/')) path += '/';
        const cleanUrl = `https://${parsed.host}${path}`;
        
        if (cleanUrl.startsWith("https://trodat-russia.ru/catalog/")) {
          const catMatch = cleanUrl.match(/\/catalog\/.+\/([^/]+)\/$/);
          if (catMatch) {
            const code = catMatch[1];
            // If code is numeric or has model name
            if (/^\d+$/.test(code) || code.toLowerCase() === 'ideal-seal') {
              discoveredUrls[code] = cleanUrl;
            }
          }
        }
      }
      await sleep(200);
    }
  }
  
  console.log(`\nDiscovered ${Object.keys(discoveredUrls).length} product page mappings.`);
  
  // Merge with existing russia_product_urls.json
  const cachePath = 'C:/Users/User/Desktop/Project/react/scratch/russia_product_urls.json';
  let existing = {};
  try {
    existing = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  } catch (e) {}
  
  const merged = { ...existing, ...discoveredUrls };
  fs.writeFileSync(cachePath, JSON.stringify(merged, null, 2));
  console.log(`Saved merged mappings to ${cachePath}`);
}

run();
