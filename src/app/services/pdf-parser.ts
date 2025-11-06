import { Injectable } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';

export interface ParsedChunk {
  text: string;
  pageNumber: number;
  chunkIndex: number;
}

@Injectable({
  providedIn: 'root',
})
export class PdfParser {
  constructor() {
    // Use dynamic version matching to avoid version mismatches
    // This gets the version from the installed package
    const pdfjsVersion = pdfjsLib.version;
    console.log(`📚 PDF.js version: ${pdfjsVersion}`);
    
    pdfjsLib.GlobalWorkerOptions.workerSrc = 
      `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.mjs`;
  }
  
  async parseFile(file: File): Promise<ParsedChunk[]> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    const chunks: ParsedChunk[] = [];
    let globalChunkIndex = 0;
    
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const text = content.items
        .map((item: any) => item.str)
        .join(' ');
      
      // Simple chunking (500 chars) with page metadata
      for (let j = 0; j < text.length; j += 500) {
        chunks.push({
          text: text.slice(j, j + 500),
          pageNumber: pageNum,
          chunkIndex: globalChunkIndex++
        });
      }
    }
    
    console.log(`📄 Parsed ${pdf.numPages} pages into ${chunks.length} chunks`);
    return chunks;
  }
}
