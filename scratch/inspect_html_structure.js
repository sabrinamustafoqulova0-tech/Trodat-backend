const fs = require('fs');
const html = fs.readFileSync('C:/Users/User/Desktop/Project/react/scratch/google_raw.html', 'utf8');

console.log('HTML Length:', html.length);
console.log('First 1000 characters:', html.substring(0, 1000));

// Find some hrefs
const hrefRegex = /href="([^"]+)"/gi;
const hrefs = [];
let match;
while ((match = hrefRegex.exec(html)) !== null) {
  hrefs.push(match[1]);
}
console.log('Total hrefs:', hrefs.length);
console.log('Sample hrefs:', hrefs.slice(0, 15));

// Find some srcs
const srcRegex = /src="([^"]+)"/gi;
const srcs = [];
while ((match = srcRegex.exec(html)) !== null) {
  srcs.push(match[1]);
}
console.log('Total srcs:', srcs.length);
console.log('Sample srcs:', srcs.slice(0, 15));
