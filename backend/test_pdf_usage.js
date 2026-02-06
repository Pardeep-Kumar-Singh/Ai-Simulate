const pdfLib = require('pdf-parse');
const fs = require('fs');

console.log('Keys:', Object.keys(pdfLib));

try {
    // Try to inspect the PDFParse class
    if (pdfLib.PDFParse) {
        console.log('PDFParse is defined.');
        console.log('Prototype:', pdfLib.PDFParse.prototype);

        // Try to instantiate?
        try {
            const instance = new pdfLib.PDFParse();
            console.log('Instance created:', instance);
        } catch (e) {
            console.log('Instantiation failed:', e.message);
        }
    }

    // Check if there is a 'default' export that is a function?
    if (pdfLib.default && typeof pdfLib.default === 'function') {
        console.log('Found default function export');
    }

} catch (e) {
    console.error(e);
}
