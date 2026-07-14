const https = require('https');

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5'
};

function fetchGoogleImages(query) {
  return new Promise((resolve) => {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch&asearch=ichunk&async=_id:rg_s,_pms:s,_fmt:pc`;
    // We can also try the standard url:
    const stdUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch`;
    
    https.get(stdUrl, { headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        const urls = [];
        
        // Pattern 1: look for raw image URLs inside script blocks
        // In modern Google Images, the URLs are stored in JSON arrays like ["https://...", height, width]
        const regex = /"https?:\/\/[^"]+?\.(?:jpg|png|jpeg|webp)"/gi;
        let match;
        while ((match = regex.exec(data)) !== null) {
          const u = match[0].replace(/"/g, '');
          if (!u.includes('google.com') && !u.includes('gstatic.com') && !u.includes('schema.org')) {
            // Unescape unicode characters if any (e.g. \u003d -> =)
            try {
              const cleanUrl = JSON.parse(`"${u}"`);
              urls.push(cleanUrl);
            } catch (e) {
              urls.push(u);
            }
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
  const query = 'Trodat Professional 5200 stamp';
  console.log(`Searching for: ${query}`);
  const urls = await fetchGoogleImages(query);
  console.log(`Found ${urls.length} high-res candidates:`);
  console.log(urls.slice(0, 10));
}

run();
