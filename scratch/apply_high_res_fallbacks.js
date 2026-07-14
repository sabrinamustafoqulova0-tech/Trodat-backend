const fs = require('fs');
const path = require('path');

const destDir = "C:/Users/User/Desktop/Project/react/public/images/stamps";
const seedPath = "C:/Users/User/Desktop/Project/backend/prisma/seed.ts";

const remainingStamps = [
  {
    "article": "46040",
    "name": "Trodat Printy 46040 Round",
    "series": "printy",
    "fallbackSource": "46050.jpg" // High-res Printy Round
  },
  {
    "article": "4928",
    "name": "Trodat Printy 4928",
    "series": "printy",
    "fallbackSource": "4911.jpg" // High-res standard Printy
  },
  {
    "article": "9411",
    "name": "Trodat Mobile Printy 9411",
    "series": "mobile",
    "fallbackSource": "9412.jpg" // High-res Mobile Printy
  },
  {
    "article": "Ideal Seal",
    "name": "Trodat Ideal Seal",
    "series": "ideal",
    "fallbackSource": "4600.jpg" // High-res Ideal Seal
  },
  {
    "article": "4836",
    "name": "Trodat Printy 4836 Numerator",
    "series": "printy",
    "fallbackSource": "4850.jpg" // High-res Printy Dater/Numerator
  },
  {
    "article": "4846",
    "name": "Trodat Printy 4846 Numerator",
    "series": "printy",
    "fallbackSource": "4850.jpg" // High-res Printy Dater/Numerator
  },
  {
    "article": "46042",
    "name": "Trodat Ideal 46042",
    "series": "ideal",
    "fallbackSource": "4600.jpg" // High-res Ideal Seal
  },
  {
    "article": "4908",
    "name": "Trodat Printy 4908",
    "series": "printy",
    "fallbackSource": "4911.jpg" // High-res standard Printy
  },
  {
    "article": "4940",
    "name": "Trodat Professional 4940 Dater",
    "series": "professional",
    "fallbackSource": "5430.jpg" // High-res Professional Dater
  },
  {
    "article": "52040",
    "name": "Trodat Professional 52040",
    "series": "professional",
    "fallbackSource": "5204.jpg" // High-res Professional
  },
  {
    "article": "52140",
    "name": "Trodat Professional 52140 Dater",
    "series": "professional",
    "fallbackSource": "5430.jpg" // High-res Professional Dater
  },
  {
    "article": "5253",
    "name": "Trodat Professional 5253 Dater",
    "series": "professional",
    "fallbackSource": "5430.jpg" // High-res Professional Dater
  },
  {
    "article": "54110",
    "name": "Trodat Professional 54110",
    "series": "professional",
    "fallbackSource": "5204.jpg" // High-res Professional
  },
  {
    "article": "54510",
    "name": "Trodat Professional 54510",
    "series": "professional",
    "fallbackSource": "5204.jpg" // High-res Professional
  },
  {
    "article": "5465",
    "name": "Trodat Professional 5465 Dater",
    "series": "professional",
    "fallbackSource": "5430.jpg" // High-res Professional Dater
  },
  {
    "article": "5485",
    "name": "Trodat Professional 5485",
    "series": "professional",
    "fallbackSource": "5204.jpg" // High-res Professional
  },
  {
    "article": "55510",
    "name": "Trodat Professional 55510 Dater",
    "series": "professional",
    "fallbackSource": "5430.jpg" // High-res Professional Dater
  },
  {
    "article": "5558",
    "name": "Trodat Professional 5558 Dater",
    "series": "professional",
    "fallbackSource": "5430.jpg" // High-res Professional Dater
  },
  {
    "article": "5756",
    "name": "Trodat Professional 5756 Dater",
    "series": "professional",
    "fallbackSource": "5430.jpg" // High-res Professional Dater
  },
  {
    "article": "9500",
    "name": "Trodat Ideal 9500",
    "series": "ideal",
    "fallbackSource": "4600.jpg" // High-res Ideal Seal
  },
  {
    "article": "9512",
    "name": "Trodat Pocket Printy 9512",
    "series": "mobile",
    "fallbackSource": "9511.jpg" // High-res Pocket Printy
  },
  {
    "article": "9515",
    "name": "Trodat Pocket Printy 9515",
    "series": "mobile",
    "fallbackSource": "9511.jpg" // High-res Pocket Printy
  }
];

function applyFallbacks() {
  console.log("Applying high-resolution sibling fallbacks for remaining low-res items...");
  let count = 0;
  
  for (const stamp of remainingStamps) {
    const destPath = path.join(destDir, `${stamp.article}.jpg`);
    const sourcePath = path.join(destDir, stamp.fallbackSource);
    
    if (fs.existsSync(sourcePath)) {
      if (fs.existsSync(destPath)) {
        fs.unlinkSync(destPath); // Remove the low-res placeholder/frame
      }
      fs.copyFileSync(sourcePath, destPath);
      console.log(`  ✅ [${stamp.article}] Copied high-res fallback from ${stamp.fallbackSource}`);
      count++;
    } else {
      console.log(`  ❌ [${stamp.article}] Source fallback ${stamp.fallbackSource} not found!`);
    }
  }
  
  console.log(`\nFallback copy operation complete. Updated ${count} image files.`);
}

applyFallbacks();
