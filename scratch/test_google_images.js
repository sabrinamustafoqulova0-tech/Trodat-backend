const https = require('https');

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
};

function searchGoogleImages(query) {
  return new Promise((resolve) => {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;
    
    https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        // Find all gstatic images or other image patterns
        // Google images page contains raw JSON data and HTML image tags
        const urls = [];
        
        // Match gstatic URLs
        const gstaticRegex = /https:\/\/encrypted-tbn[0-9]\.gstatic\.com\/images\?q=tbn:[^"'\s&]+/g;
        let match;
        while ((match = gstaticRegex.exec(data)) !== null) {
          urls.push(match[0]);
        }
        
        // Also look for other http/https images in data-urls if any
        const httpRegex = /"(https?:\/\/[^"\s]+?\.(?:jpg|png|jpeg|webp))"/gi;
        while ((match = httpRegex.exec(data)) !== null) {
          if (!match[1].includes('google') && !match[1].includes('gstatic')) {
            urls.push(match[1]);
          }
        }
        
        resolve([...new Set(urls)]);
      });
    }).on('error', (err) => {
      console.error(err);
      resolve([]);
    });
  });
}

async function run() {
  const urls = await searchGoogleImages('Trodat Printy 4910 stamp');
  console.log('Found urls:', urls.slice(0, 10));
}

run();
