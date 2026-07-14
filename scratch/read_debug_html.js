const fs = require('fs');
const html = fs.readFileSync('C:/Users/User/Desktop/Project/react/scratch/ddg_debug.html', 'utf8');
console.log(html.substring(0, 1500));
