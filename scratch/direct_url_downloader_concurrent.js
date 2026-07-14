const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');

const destDir = "C:/Users/User/Desktop/Project/react/public/images/stamps";

const remainingStamps = [
  {
    "article": "4922",
    "name": "Trodat Printy 4922 Square",
    "series": "printy"
  },
  {
    "article": "46025",
    "name": "Trodat Printy 46025 Round",
    "series": "printy"
  },
  {
    "article": "46030",
    "name": "Trodat Printy 46030 Round",
    "series": "printy"
  },
  {
    "article": "46040",
    "name": "Trodat Printy 46040 Round",
    "series": "printy"
  },
  {
    "article": "4642",
    "name": "Trodat Printy 4642 Round",
    "series": "printy"
  },
  {
    "article": "46045",
    "name": "Trodat Printy 46045 Round",
    "series": "printy"
  },
  {
    "article": "4926",
    "name": "Trodat Printy 4926",
    "series": "printy"
  },
  {
    "article": "4928",
    "name": "Trodat Printy 4928",
    "series": "printy"
  },
  {
    "article": "4929",
    "name": "Trodat Printy 4929",
    "series": "printy"
  },
  {
    "article": "5203",
    "name": "Trodat Professional 5203",
    "series": "professional"
  },
  {
    "article": "5204",
    "name": "Trodat Professional 5204",
    "series": "professional"
  },
  {
    "article": "9411",
    "name": "Trodat Mobile Printy 9411",
    "series": "mobile"
  },
  {
    "article": "9413",
    "name": "Trodat Mobile Printy 9413",
    "series": "mobile"
  },
  {
    "article": "9425",
    "name": "Trodat Mobile Printy 9425 Square",
    "series": "mobile"
  },
  {
    "article": "4750",
    "name": "Trodat Printy 4750 Dater",
    "series": "printy"
  },
  {
    "article": "5430",
    "name": "Trodat Professional 5430 Dater",
    "series": "professional"
  },
  {
    "article": "5440",
    "name": "Trodat Professional 5440 Dater",
    "series": "professional"
  },
  {
    "article": "Ideal Seal",
    "name": "Trodat Ideal Seal",
    "series": "ideal"
  },
  {
    "article": "4810",
    "name": "Trodat Printy 4810 Dater",
    "series": "printy"
  },
  {
    "article": "4820",
    "name": "Trodat Printy 4820 Dater",
    "series": "printy"
  },
  {
    "article": "4836",
    "name": "Trodat Printy 4836 Numerator",
    "series": "printy"
  },
  {
    "article": "4846",
    "name": "Trodat Printy 4846 Numerator",
    "series": "printy"
  },
  {
    "article": "9342",
    "name": "Trodat Micro Printy 9342",
    "series": "mobile"
  },
  {
    "article": "9052",
    "name": "Trodat Stamp Pad 9052",
    "series": "accessories"
  },
  {
    "article": "46042",
    "name": "Trodat Ideal 46042",
    "series": "ideal"
  },
  {
    "article": "46050",
    "name": "Trodat Printy 46050",
    "series": "printy"
  },
  {
    "article": "4612",
    "name": "Trodat Printy 4612",
    "series": "printy"
  },
  {
    "article": "46140",
    "name": "Trodat Printy 46140",
    "series": "printy"
  },
  {
    "article": "46145",
    "name": "Trodat Printy 46145",
    "series": "printy"
  },
  {
    "article": "4645",
    "name": "Trodat Printy 4645",
    "series": "printy"
  },
  {
    "article": "4724",
    "name": "Trodat Printy 4724",
    "series": "printy"
  },
  {
    "article": "4817",
    "name": "Trodat Printy 4817",
    "series": "printy"
  },
  {
    "article": "4822",
    "name": "Trodat Printy 4822 Dater",
    "series": "printy"
  },
  {
    "article": "4850",
    "name": "Trodat Printy 4850 Dater",
    "series": "printy"
  },
  {
    "article": "4908",
    "name": "Trodat Printy 4908",
    "series": "printy"
  },
  {
    "article": "4925",
    "name": "Trodat Printy 4925",
    "series": "printy"
  },
  {
    "article": "4931",
    "name": "Trodat Printy 4931",
    "series": "printy"
  },
  {
    "article": "4940",
    "name": "Trodat Professional 4940 Dater",
    "series": "professional"
  },
  {
    "article": "52040",
    "name": "Trodat Professional 52040",
    "series": "professional"
  },
  {
    "article": "52045",
    "name": "Trodat Professional 52045",
    "series": "professional"
  },
  {
    "article": "52140",
    "name": "Trodat Professional 52140 Dater",
    "series": "professional"
  },
  {
    "article": "5253",
    "name": "Trodat Professional 5253 Dater",
    "series": "professional"
  },
  {
    "article": "54045",
    "name": "Trodat Professional 54045 Dater",
    "series": "professional"
  },
  {
    "article": "54110",
    "name": "Trodat Professional 54110",
    "series": "professional"
  },
  {
    "article": "54510",
    "name": "Trodat Professional 54510",
    "series": "professional"
  },
  {
    "article": "5465",
    "name": "Trodat Professional 5465 Dater",
    "series": "professional"
  },
  {
    "article": "5474",
    "name": "Trodat Professional 5474",
    "series": "professional"
  },
  {
    "article": "5485",
    "name": "Trodat Professional 5485",
    "series": "professional"
  },
  {
    "article": "5546",
    "name": "Trodat Professional 5546 Dater",
    "series": "professional"
  },
  {
    "article": "55510",
    "name": "Trodat Professional 55510 Dater",
    "series": "professional"
  },
  {
    "article": "5558",
    "name": "Trodat Professional 5558 Dater",
    "series": "professional"
  },
  {
    "article": "5756",
    "name": "Trodat Professional 5756 Dater",
    "series": "professional"
  },
  {
    "article": "9051",
    "name": "Trodat Accessories 9051",
    "series": "accessories"
  },
  {
    "article": "9053",
    "name": "Trodat Accessories 9053",
    "series": "accessories"
  },
  {
    "article": "9430",
    "name": "Trodat Mobile Printy 9430",
    "series": "mobile"
  },
  {
    "article": "9500",
    "name": "Trodat Ideal 9500",
    "series": "ideal"
  },
  {
    "article": "9512",
    "name": "Trodat Pocket Printy 9512",
    "series": "mobile"
  },
  {
    "article": "9515",
    "name": "Trodat Pocket Printy 9515",
    "series": "mobile"
  }
];

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
};

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { headers, timeout: 5000 }, (res) => {
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
    });
    req.on('error', (err) => {
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

function getCandidates(stamp) {
  const art = stamp.article;
  const list = [];

  list.push(`https://www.thestampmaker.com/images/products/trodat-${art}.jpg`);
  list.push(`https://www.thestampmaker.com/images/products/trodat-${art}.png`);
  list.push(`https://www.thestampmaker.com/images/products/trodat-printy-${art}.jpg`);
  list.push(`https://www.thestampmaker.com/images/products/trodat-professional-${art}.jpg`);
  
  if (stamp.series === 'mobile') {
    list.push(`https://www.thestampmaker.com/images/products/trodat-mobile-${art}.jpg`);
    list.push(`https://www.thestampmaker.com/images/products/trodat-pocket-${art}.jpg`);
    list.push(`https://cdn.simplystamps.com/media/catalog/product/t/r/trodat-mobile-${art}.jpg`);
    list.push(`https://cdn.simplystamps.com/media/catalog/product/t/r/trodat-pocket-${art}.jpg`);
  }

  if (stamp.series === 'ideal') {
    list.push(`https://www.thestampmaker.com/images/products/ideal-seal-press.jpg`);
    list.push(`https://www.thestampmaker.com/images/products/trodat-ideal-seal.jpg`);
  }

  list.push(`https://cdn.simplystamps.com/media/catalog/product/t/r/trodat-${art}.jpg`);
  list.push(`https://cdn.simplystamps.com/media/catalog/product/t/r/trodat-${art}-hcb.jpg`);
  list.push(`https://cdn.simplystamps.com/media/catalog/product/cache/5/image/600x600/9df78eab33525d08d6e5fb8d27136e95/t/r/trodat-${art}.jpg`);

  list.push(`https://www.rubberstamps.net/images/products/self-inking-stamps/${art}/${art}.jpg`);
  list.push(`https://www.rubberstamps.net/images/products/self-inking-stamps/${art}/${art}.png`);
  list.push(`https://www.rubberstamps.net/images/products/self-inking-stamps/trodat/${art}.jpg`);
  list.push(`https://www.rubberstamps.net/images/products/${art}.jpg`);

  list.push(`https://www.stamp-connection.com/images/Products/Trodat/${art}-190px.png`);
  
  return [...new Set(list)];
}

const CONCURRENCY = 8;

async function processStamp(stamp) {
  const candidates = getCandidates(stamp);
  for (const url of candidates) {
    const filePath = path.join(destDir, `${stamp.article}.jpg`);
    const tempPath = path.join(destDir, `${stamp.article}_temp.jpg`);
    
    try {
      await downloadImage(url, tempPath);
      const stats = fs.statSync(tempPath);
      if (stats.size > 10000) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        fs.renameSync(tempPath, filePath);
        console.log(`  ✅ [${stamp.article}] SUCCESS from ${url} (${Math.round(stats.size/1024)} KB)`);
        return true;
      } else {
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      }
    } catch (err) {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
  }
  console.log(`  ❌ [${stamp.article}] Failed all candidates`);
  return false;
}

async function run() {
  console.log(`Starting concurrent download of ${remainingStamps.length} stamps with concurrency ${CONCURRENCY}...`);
  
  let index = 0;
  let successCount = 0;
  
  async function worker() {
    while (index < remainingStamps.length) {
      const myIdx = index++;
      const stamp = remainingStamps[myIdx];
      const success = await processStamp(stamp);
      if (success) successCount++;
    }
  }
  
  const workers = Array(CONCURRENCY).fill(null).map(() => worker());
  await Promise.all(workers);
  
  console.log(`\n=== Direct Downloader Summary ===`);
  console.log(`Successfully Downloaded: ${successCount} / ${remainingStamps.length}`);
}

run();
