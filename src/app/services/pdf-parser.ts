import { Injectable } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';

@Injectable({
  providedIn: 'root',
})
export class PdfParser {
  constructor() {
    // Configure worker path - must match installed version (5.4.296)
    pdfjsLib.GlobalWorkerOptions.workerSrc = 
      'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.296/build/pdf.worker.mjs';
  }
  
  async parseFile(file: File): Promise<string[]> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const chunks: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items
        .map((item: any) => item.str)
        .join(' ');
      
      // Simple chunking (500 chars)
      for (let j = 0; j < text.length; j += 500) {
        chunks.push(text.slice(j, j + 500));
      }
    }
    return chunks;
  }
}
