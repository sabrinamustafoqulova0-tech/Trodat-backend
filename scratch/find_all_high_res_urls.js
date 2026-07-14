const fs = require('fs');
const https = require('https');
const path = require('path');

const seedPath = "C:/Users/User/Desktop/Project/backend/prisma/seed.ts";
const content = fs.readFileSync(seedPath, 'utf8');

// Parse stamps from seed.ts
// A stamp block looks like:
// {
//   article: '4910',
//   name: 'Trodat Printy 4910',
//   series: 'printy',
//   ...
// }
// Let's use a regex to capture each stamp block and extract article, name, and series.
const regex = /article:\s*'([^']+)'[\s\S]*?name:\s*'([^']+)'[\s\S]*?series:\s*'([^']+)'/g;
let match;
const stamps = [];
while ((match = regex.exec(content)) !== null) {
  stamps.push({
    article: match[1],
    name: match[2],
    series: match[3].toLowerCase()
  });
}

console.log(`Parsed ${stamps.length} stamps from seed.ts`);

// Helper function to check HEAD request of a URL
function checkUrl(url) {
  return new Promise((resolve) => {
    const req = https.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

// Map of found URLs
const foundUrls = {};

async function findUrls() {
  for (let i = 0; i < stamps.length; i++) {
    const stamp = stamps[i];
    const art = stamp.article;
    const ser = stamp.series;

    // Skip accessories (ink, pads) for a different check or default check
    if (art === 'Ideal Seal') {
      // Custom candidate
      const candidates = [
        'https://www.thestampmaker.com/images/products/trodat-ideal-seal.jpg',
        'https://www.thestampmaker.com/images/products/ideal-seal.jpg',
        'https://www.thestampmaker.com/images/products/trodat-ideal.jpg'
      ];
      let found = false;
      for (const url of candidates) {
        if (await checkUrl(url)) {
          foundUrls[art] = url;
          console.log(`[${i+1}/${stamps.length}] Found for ${art}: ${url}`);
          found = true;
          break;
        }
      }
      if (!found) console.log(`[${i+1}/${stamps.length}] NOT found for ${art}`);
      continue;
    }

    // Candidate URL variations
    const candidates = [];
    
    // Add variations based on series
    if (ser === 'printy') {
      candidates.push(`https://www.thestampmaker.com/images/products/trodat-printy-${art}.jpg`);
      candidates.push(`https://www.thestampmaker.com/images/products/trodat-${art}-printy.jpg`);
    } else if (ser === 'professional') {
      candidates.push(`https://www.thestampmaker.com/images/products/trodat-professional-${art}.jpg`);
      candidates.push(`https://www.thestampmaker.com/images/products/trodat-${art}-professional.jpg`);
    } else if (ser === 'mobile') {
      candidates.push(`https://www.thestampmaker.com/images/products/trodat-mobile-printy-${art}.jpg`);
      candidates.push(`https://www.thestampmaker.com/images/products/trodat-mobile-${art}.jpg`);
    } else if (ser === 'pocket') {
      candidates.push(`https://www.thestampmaker.com/images/products/trodat-pocket-printy-${art}.jpg`);
      candidates.push(`https://www.thestampmaker.com/images/products/trodat-pocket-${art}.jpg`);
    } else if (ser === 'ideal') {
      candidates.push(`https://www.thestampmaker.com/images/products/trodat-ideal-${art}.jpg`);
    }

    // Generic variations
    candidates.push(`https://www.thestampmaker.com/images/products/trodat-${art}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/${art}.jpg`);
    
    // Check if the article contains 'Dater' or similar, we can strip it or handle it
    const cleanArt = art.replace(/\s+Dater/gi, '').replace(/\s+Numerator/gi, '').replace(/\s+/g, '-').toLowerCase();
    candidates.push(`https://www.thestampmaker.com/images/products/trodat-${cleanArt}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/trodat-printy-${cleanArt}.jpg`);
    candidates.push(`https://www.thestampmaker.com/images/products/trodat-professional-${cleanArt}.jpg`);

    let found = false;
    for (const url of candidates) {
      if (await checkUrl(url)) {
        foundUrls[art] = url;
        console.log(`[${i+1}/${stamps.length}] Found for ${art}: ${url}`);
        found = true;
        break;
      }
    }

    if (!found) {
      console.log(`[${i+1}/${stamps.length}] NOT found for ${art} (tested ${candidates.length} candidates)`);
    }

    // Small delay to be polite
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  // Save the result to a JSON file
  fs.writeFileSync('C:/Users/User/Desktop/Project/react/scratch/found_urls.json', JSON.stringify(foundUrls, null, 2));
  console.log(`Done! Found ${Object.keys(foundUrls).length} of ${stamps.length} images.`);
}

findUrls();
