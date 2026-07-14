const fs = require('fs');
const path = require('path');

const destDir = "C:/Users/User/Desktop/Project/react/public/images/stamps";
const files = fs.readdirSync(destDir);

function getJpegDimensions(buffer) {
  let i = 2; // skip SOI
  while (i < buffer.length) {
    if (buffer[i] !== 0xFF) {
      // Not a valid marker, skip or stop
      i++;
      continue;
    }
    const marker = buffer[i + 1];
    if (marker === 0xD9 || marker === 0xDA) {
      // EOI or SOS, stop
      break;
    }
    // SOF0 (Start of Frame 0) is 0xC0, SOF2 is 0xC2
    if (marker === 0xC0 || marker === 0xC1 || marker === 0xC2 || marker === 0xC3 ||
        marker === 0xC5 || marker === 0xC6 || marker === 0xC7 ||
        marker === 0xC9 || marker === 0xCA || marker === 0xCB ||
        marker === 0xCD || marker === 0xCE || marker === 0xCF) {
      const height = buffer.readUInt16BE(i + 5);
      const width = buffer.readUInt16BE(i + 7);
      return { width, height };
    }
    // Skip marker content
    const length = buffer.readUInt16BE(i + 2);
    i += 2 + length;
  }
  return null;
}

function getPngDimensions(buffer) {
  if (buffer.readUInt32BE(12) === 0x49484452) { // IHDR
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
  }
  return null;
}

console.log("Checking image dimensions for low-size files:");
for (const file of files) {
  const filePath = path.join(destDir, file);
  const stats = fs.statSync(filePath);
  if (stats.isDirectory()) continue;
  
  if (stats.size < 15000) {
    const buffer = fs.readFileSync(filePath);
    let dims = null;
    let type = 'unknown';
    
    if (buffer.toString('utf8', 0, 4).includes('<svg') || buffer.toString('utf8', 0, 10).includes('<?xml')) {
      type = 'SVG';
      dims = { width: 'vector', height: 'vector' };
    } else if (buffer[0] === 0xFF && buffer[1] === 0xD8) {
      type = 'JPEG';
      try { dims = getJpegDimensions(buffer); } catch (e) {}
    } else if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      type = 'PNG';
      try { dims = getPngDimensions(buffer); } catch (e) {}
    }
    
    console.log(`- File: ${file} | Size: ${Math.round(stats.size/1024)} KB | Type: ${type} | Dimensions: ${dims ? `${dims.width}x${dims.height}` : 'unknown'}`);
  }
}
