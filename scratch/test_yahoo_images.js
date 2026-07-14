const https = require('https');

const query = 'Trodat Professional 5480 Dater';
const url = `https://images.search.yahoo.com/search/images?p=${encodeURIComponent(query)}`;

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
};

https.get(url, { headers }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`HTML Length: ${data.length}`);
    
    // Find image URLs or JSON
    // Look for tags, urls, data-src, etc.
    const regex = /"imgurl":"([^"]+)"/g;
    let match;
    const urls = [];
    while ((match = regex.exec(data)) !== null) {
      urls.push(match[1]);
    }
    
    console.log(`Found ${urls.length} imgurl matches:`);
    console.log(urls.slice(0, 10));
    
    if (urls.length === 0) {
      // Check other patterns, e.g. <img class="..." src="..."
      const imgRegex = /<img[^>]+src="([^"]+)"/gi;
      let imgMatch;
      const imgUrls = [];
      while ((imgMatch = imgRegex.exec(data)) !== null) {
        imgUrls.push(imgMatch[1]);
      }
      console.log(`Found ${imgUrls.length} standard img tags:`);
      console.log(imgUrls.slice(0, 10));
    }
  });
}).on('error', console.error);
