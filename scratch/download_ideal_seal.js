const fs = require('fs');
const https = require('https');
const path = require('path');

const destDir = "C:/Users/User/Desktop/Project/react/public/images/stamps";
const imageUrl = "https://trodat-russia.ru/upload/iblock/b77/Seal Black 41 BD Closed.jpg";
const fallbackUrl = "https://trodat-russia.ru/upload/resize_cache/iblock/b77/250_210_1/Seal Black 41 BD Closed.jpg";

const headers = { 'User-Agent': 'Mozilla/5.0' };

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers }, (res) => {
      if (res.statusCode !== 200) {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        reject(new Error(`Status ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });
  });
}

async function run() {
  const tempPath = path.join(destDir, "temp_ideal.jpg");
  
  console.log(`Downloading high-res Ideal Seal image from: ${imageUrl}`);
  try {
    await download(imageUrl, tempPath);
    console.log(`  ✅ Downloaded original high-res version.`);
  } catch (e) {
    console.log(`  Original failed (${e.message}), trying resized version: ${fallbackUrl}`);
    await download(fallbackUrl, tempPath);
    console.log(`  ✅ Downloaded resized version.`);
  }
  
  const stats = fs.statSync(tempPath);
  console.log(`Downloaded image size: ${Math.round(stats.size/1024)} KB`);
  
  // Overwrite the target files
  const targets = ["Ideal Seal.jpg", "4600.jpg", "46042.jpg", "9500.jpg"];
  for (const target of targets) {
    const dest = path.join(destDir, target);
    if (fs.existsSync(dest)) fs.unlinkSync(dest);
    fs.copyFileSync(tempPath, dest);
    console.log(`  ✅ Overwrote ${target}`);
  }
  
  fs.unlinkSync(tempPath);
}

run();
