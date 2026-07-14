const fs = require('fs');
const html = fs.readFileSync('C:/Users/User/Desktop/Project/react/scratch/ddg_raw.html', 'utf8');

// Find all results with links
const regex = /<a class="result__snippet"[^>]*href="([^"]+)"/gi;
const links = [];
let match;
while ((match = regex.exec(html)) !== null) {
  // DDG redirects links through a proxy, like:
  // href="//duckduckgo.com/l/?kh=-1&amp;uddg=https%3A%2F%2Fwww.trodat.net%2F..."
  let link = match[1];
  if (link.includes('uddg=')) {
    const uddg = link.split('uddg=')[1];
    link = decodeURIComponent(uddg);
  }
  links.push(link);
}

console.log('Total links found:', links.length);
console.log('Sample links:', links.slice(0, 10));
