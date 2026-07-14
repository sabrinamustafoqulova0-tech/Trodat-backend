const fs = require('fs');

const seedPath = "C:/Users/User/Desktop/Project/backend/prisma/seed.ts";
let content = fs.readFileSync(seedPath, 'utf8');

// Regex to match colors: [ ... ] inside stamps array
// It handles single quotes, double quotes, newlines, spaces
const updatedContent = content.replace(/colors:\s*\[[^\]]+\]/g, 'colors: ["Black"]');

fs.writeFileSync(seedPath, updatedContent, 'utf8');
console.log('Successfully updated seed.ts casing colors to ["Black"]!');
