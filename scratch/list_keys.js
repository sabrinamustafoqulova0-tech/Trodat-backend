const fs = require('fs');
const urls = JSON.parse(fs.readFileSync('C:/Users/User/Desktop/Project/react/scratch/russia_product_urls.json', 'utf8'));
console.log(Object.keys(urls).sort());
