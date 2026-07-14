/**
 * Check actual dimensions of the last 5 problematic images
 * to understand if the threshold is too strict or if files are genuinely low-res
 */
const fs = require('fs');
const path = require('path');

const destDir = "C:/Users/User/Desktop/Project/react/public/images/stamps";
const articles = ["46040", "46050", "46140", "54045", "5474"];

function getJpegDimensions(buffer) {
  let i = 2;
  while (i < buffer.length) {
    if (buffer[i] !== 0xFF) { i++; continue; }
    const marker = buffer[i + 1];
    if (marker === 0xD9 || marker === 0xDA) break;
    if ([0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF].includes(marker)) {
      try {
        return { height: buffer.readUInt16BE(i + 5), width: buffer.readUInt16BE(i + 7) };
      } catch { return null; }
    }
    const length = buffer.readUInt16BE(i + 2);
    i += 2 + length;
  }
  return null;
}

function getPngDimensions(buffer) {
  if (buffer.length > 24 && buffer.readUInt32BE(12) === 0x49484452) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  return null;
}

for (const article of articles) {
  // Try .jpg and .png
  for (const ext of ['.jpg', '.png']) {
    const filePath = path.join(destDir, `${article}${ext}`);
    if (!fs.existsSync(filePath)) continue;
    
    const stats = fs.statSync(filePath);
    const buffer = fs.readFileSync(filePath);
    let dims = null;
    
    if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
      dims = getJpegDimensions(buffer);
    } else if (buffer[0] === 0x89 && buffer[1] === 0x50) {
      dims = getPngDimensions(buffer);
    }
    
    console.log(`[${article}${ext}] Size: ${Math.round(stats.size/1024)} KB | Dims: ${dims ? `${dims.width}x${dims.height}` : 'unknown'}`);
  }
}
