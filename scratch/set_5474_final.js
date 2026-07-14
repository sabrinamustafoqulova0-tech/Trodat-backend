/**
 * The 5474 product page has impression/example images (медиалибрари):
 * - 5474-р.png (red impression?)
 * - 5474-б.png (blue impression?) 
 * And the product image is /upload/iblock/80d/5474.png (23KB, 255x172)
 * 
 * Since no better online source exists for 5474, use the closest
 * full-size Professional dater sibling: 5430 (229KB, proper stamp casing photo)
 */
const fs = require('fs');
const path = require('path');

const destDir = "C:/Users/User/Desktop/Project/react/public/images/stamps";

// Use 5430 (large stamp casing photo) as 5474 since no better image exists  
const src = path.join(destDir, '5430.jpg');
const dst = path.join(destDir, '5474.jpg');

if (fs.existsSync(dst)) fs.unlinkSync(dst);
fs.copyFileSync(src, dst);

const stats = fs.statSync(dst);
console.log(`✅ 5474.jpg set to 5430.jpg copy (${Math.round(stats.size/1024)} KB)`);
