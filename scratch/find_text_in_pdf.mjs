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

  const targets = ['4600', '9500', '9515', '9413', '9425', '46119', '5215', 'Ideal Seal'];
  console.log(`Searching PDF (${pdfDoc.numPages} pages) for target articles...`);

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');

    targets.forEach(target => {
      // Find as word boundaries
      const regex = new RegExp('\\b' + target + '\\b', 'i');
      if (regex.test(pageText)) {
        console.log(`- Found "${target}" on Page ${pageNum}`);
      }
    });
  }
}

main().catch(console.error);
