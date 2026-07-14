const fs = require('fs');
const pdf = require('pdf-parse');

const pdfPath = 'C:\\Users\\User\\Downloads\\Telegram Desktop\\Сatalog Trodat 2021.pdf';

let dataBuffer = fs.readFileSync(pdfPath);

pdf(dataBuffer).then(function(data) {
    console.log("Number of pages: ", data.numpages);
    console.log("Text info: ", data.info);
    fs.writeFileSync('output.txt', data.text);
    console.log("Text successfully extracted to output.txt");
}).catch(function(error) {
    console.error("Error extracting text: ", error);
});
