const fs = require('fs');

const cache = JSON.parse(fs.readFileSync('C:/Users/User/Desktop/Project/react/scratch/russia_product_urls.json', 'utf8'));
const remaining = [
  '9413', '9425', 'Ideal Seal', '4810', '4846', '9052', '44045', '4600', 
  '46042', '46119', '4822', '4940', '52140', '5215', '5253', '54110', 
  '5435', '54510', '5465', '5485', '55510', '9051', '9440', '9500'
];

remaining.forEach(art => {
  console.log(`${art}: ${cache[art] ? cache[art] : 'Not in cache'}`);
});
