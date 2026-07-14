const fs = require('fs');
const https = require('https');
const urlModule = require('url');
const path = require('path');

const destDir = "C:/Users/User/Desktop/Project/react/public/images/stamps";

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
};

function makeRequest(url) {
  return new Promise((resolve) => {
    https.get(url, { headers, timeout: 10000 }, (res) => {
      if (res.statusCode !== 200) {
        resolve({ html: '', statusCode: res.statusCode });
        return;
      }
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ html: data, statusCode: res.statusCode }));
    }).on('error', () => {
      resolve({ html: '', statusCode: 0 });
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

async function crawl() {
  const startUrls = [
    "https://trodat-russia.ru/catalog/",
    "https://trodat-russia.ru/catalog/classic/",
    "https://trodat-russia.ru/catalog/ideal/",
    "https://trodat-russia.ru/catalog/mobilnye-shtampy/",
    "https://trodat-russia.ru/catalog/printy/",
    "https://trodat-russia.ru/catalog/professional/"
  ];

  const queue = [...startUrls];
  const visited = new Set();
  const productUrls = {};

  console.log("Crawling trodat-russia.ru for product pages...");
  
  while (queue.length > 0) {
    const currentUrl = queue.shift();
    if (visited.has(currentUrl)) continue;
    visited.add(currentUrl);

    console.log(`  Crawling queue item: ${currentUrl}`);
    const { html, statusCode } = await makeRequest(currentUrl);
    if (statusCode !== 200) continue;

    // Find all hrefs
    const hrefRegex = /href="([^"]+)"/gi;
    let match;
    while ((match = hrefRegex.exec(html)) !== null) {
      let href = match[1];
      const fullHref = urlModule.resolve(currentUrl, href);
      const parsed = urlModule.parse(fullHref);
      let path = parsed.path || '';
      if (!path.endsWith('/')) path += '/';
      const cleanUrl = `https://${parsed.host}${path}`;

      if (cleanUrl.startsWith("https://trodat-russia.ru/catalog/")) {
        const catMatch = cleanUrl.match(/\/catalog\/.+\/([^/]+)\/$/);
        if (catMatch) {
          const code = catMatch[1];
          // If code is numeric or 'ideal-seal'
          if (/^\d+$/.test(code) || code.toLowerCase() === 'ideal-seal') {
            if (!productUrls[code]) {
              productUrls[code] = cleanUrl;
              console.log(`    [Found Product Page] '${code}' -> ${cleanUrl}`);
            }
          } else {
            if (!visited.has(cleanUrl) && !queue.includes(cleanUrl)) {
              queue.push(cleanUrl);
            }
          }
        }
      }
    }
    // Polite delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`Crawl completed. Found ${Object.keys(productUrls).length} product pages.`);
  fs.writeFileSync('C:/Users/User/Desktop/Project/react/scratch/russia_product_urls.json', JSON.stringify(productUrls, null, 2));
  return productUrls;
}

async function extractAndDownloadImages(productUrls) {
  console.log("\nExtracting and downloading images from product pages...");
  
  // Read seed.ts to find which ones we actually want
  const seedPath = "C:/Users/User/Desktop/Project/backend/prisma/seed.ts";
  const seedContent = fs.readFileSync(seedPath, 'utf8');
  const stampRegex = /article:\s*'([^']+)'/g;
  let match;
  const articlesNeeded = new Set();
  while ((match = stampRegex.exec(seedContent)) !== null) {
    articlesNeeded.add(match[1]);
  }

  console.log(`Total unique articles needed: ${articlesNeeded.size}`);

  let downloadedCount = 0;

  for (const article of articlesNeeded) {
    // Check if we already have a high-res image (file size > 10KB)
    const filePath = path.join(destDir, `${article}.jpg`);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.size > 10000) {
        console.log(`Already have high-res image for ${article} (${Math.round(stats.size/1024)} KB)`);
        continue;
      }
    }

    const prodUrl = productUrls[article];
    if (!prodUrl) {
      console.log(`No product page found on trodat-russia.ru for ${article}`);
      continue;
    }

    console.log(`Fetching product page for ${article}: ${prodUrl}...`);
    const { html } = await makeRequest(prodUrl);
    if (!html) continue;

    // Find all images
    const imgRegex = /<img[^>]+src="([^"]+)"[^>]*>/gi;
    const imgUrls = [];
    while ((match = imgRegex.exec(html)) !== null) {
      const src = match[1];
      const fullSrc = urlModule.resolve(prodUrl, src);
      if (!fullSrc.includes('logo') && !fullSrc.includes('icon') && !fullSrc.includes('flag')) {
        imgUrls.push(fullSrc);
      }
    }

    // Try to find the best image URL:
    // 1. Image containing '/upload/' and article number
    // 2. Image containing '/upload/' and having class 'js-img'
    // 3. Any image containing '/upload/iblock/'
    let bestImgUrl = null;
    for (const imgUrl of imgUrls) {
      if (imgUrl.includes('/upload/') && imgUrl.includes(article)) {
        bestImgUrl = imgUrl;
        break;
      }
    }

    if (!bestImgUrl) {
      // Find class="js-img" or just anything in /upload/iblock/
      for (const imgUrl of imgUrls) {
        if (imgUrl.includes('/upload/iblock/')) {
          bestImgUrl = imgUrl;
          break;
        }
      }
    }

    if (bestImgUrl) {
      console.log(`Found candidate image for ${article}: ${bestImgUrl}`);
      try {
        await downloadImage(bestImgUrl, filePath);
        downloadedCount++;
        console.log(`  ✅ SUCCESS: Downloaded ${article}.jpg`);
      } catch (err) {
        console.error(`  ❌ FAILED to download image for ${article}: ${err.message}`);
      }
    } else {
      console.log(`Could not find a valid product image in HTML for ${article}`);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log(`\nRussia Crawl Downloader Complete. Downloaded ${downloadedCount} new images.`);
}

async function run() {
  let productUrls;
  const cachedPath = 'C:/Users/User/Desktop/Project/react/scratch/russia_product_urls.json';
  if (fs.existsSync(cachedPath)) {
    console.log("Loading cached trodat-russia.ru product URLs...");
    productUrls = JSON.parse(fs.readFileSync(cachedPath, 'utf8'));
  } else {
    productUrls = await crawl();
  }
  await extractAndDownloadImages(productUrls);
}

run();
