import { getDocument } from 'file:///C:/Users/User/.gemini/antigravity/brain/9b44b8c2-a38f-4ad1-98b3-efa0c7d86c15/scratch/node_modules/pdfjs-dist/legacy/build/pdf.mjs';
import { readFileSync } from 'fs';

const PDF_PATH = 'C:\\Users\\User\\Desktop\\Сatalog Trodat 2021.pdf';
const fileBytes = readFileSync(PDF_PATH);
const data = new Uint8Array(fileBytes.buffer.slice(0));

async function main() {
  const pdfDoc = await getDocument({
    data,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
    verbosity: 0,
  }).promise;

  for (const pageNum of [48, 65]) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    console.log(`\n--- PAGE ${pageNum} ---`);
    console.log(pageText);
  }
}

main().catch(console.error);
