const https = require('https');

const query = 'Trodat Professional 5207';
const url = `https://search.yahoo.com/search?p=${encodeURIComponent(query)}`;
const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
};

https.get(url, { headers }, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Yahoo Status:', res.statusCode);
    console.log('Length:', data.length);
    
    // Extract links
    // Links in Yahoo are typically wrapped in <a class=" d-ib fz-20 lh-26 td-hu tc va-bot title" ... href="...">
    // Or we can just look for urls containing simplystamps.com or thestampmaker.com or trodat.net
    const regex = /href="(https?:\/\/[^"]+)"/gi;
    let match;
    const links = [];
    while ((match = regex.exec(data)) !== null) {
      const link = match[1];
      if (link.includes('simplystamps.com') || link.includes('thestampmaker.com') || link.includes('trodat.net') || link.includes('rubberstamps.net')) {
        links.push(link);
      }
    }
    console.log('Found Yahoo target links:', [...new Set(links)]);
  });
});
