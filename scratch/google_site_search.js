const https = require('https');
const urlModule = require('url');

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
};

function fetchUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

async function getProductPageAndImage(query) {
  // Use duckduckgo html search
  const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  console.log(`Searching DDG: ${searchUrl}`);
  const html = await fetchUrl(searchUrl);
  
  // Extract all links
  const regex = /<a class="result__snippet"[^>]*href="([^"]+)"/gi;
  const links = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    let link = match[1];
    if (link.includes('uddg=')) {
      link = decodeURIComponent(link.split('uddg=')[1].split('&')[0]);
    }
    links.push(link);
  }
  
  console.log('Found links:', links.slice(0, 3));
  
  // Try the first link
  if (links.length > 0) {
    const prodUrl = links[0];
    console.log(`Fetching product page: ${prodUrl}`);
    const prodHtml = await fetchUrl(prodUrl);
    
    // Find all image URLs in the page
    const imgRegex = /<img[^>]+src="([^"]+)"/gi;
    const imgUrls = [];
    while ((match = imgRegex.exec(prodHtml)) !== null) {
      const src = match[1];
      const fullSrc = urlModule.resolve(prodUrl, src);
      imgUrls.push(fullSrc);
    }
    
    console.log('Found images in page:', imgUrls.slice(0, 10));
  }
}

getProductPageAndImage('Trodat Professional 5207');
