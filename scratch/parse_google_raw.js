const fs = require('fs');
const html = fs.readFileSync('C:/Users/User/Desktop/Project/react/scratch/google_raw.html', 'utf8');

// Under MSIE 6.0, Google Image search usually returns <table> tags containing <a> links with image info.
// The structure is usually like:
// <a href="/url?q=http://original-image-url.jpg&amp;...">
// Let's use a regex to extract these links!
const regex = /\/url\?q=(https?:\/\/[^&"]+)/gi;
let match;
const urls = [];
while ((match = regex.exec(html)) !== null) {
  const dec = decodeURIComponent(match[1]);
  if (!dec.includes('google.com') && !dec.includes('gstatic.com') && !dec.includes('schema.org')) {
    urls.push(dec);
  }
}

console.log('Found original image URLs:', urls.slice(0, 10));
