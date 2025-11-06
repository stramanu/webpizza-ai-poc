import { Injectable } from '@angular/core';

interface Chunk {
  id: string;
  text: string;
  embedding: number[];
  metadata?: Record<string, any>;
}

export interface SearchResult {
  chunk: Chunk;
  score: number;
}

@Injectable({
  providedIn: 'root',
})
export class VectorStore {
  private db: IDBDatabase | null = null;
  
  async initialize(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('webpizza-vectors', 1);
      request.onupgradeneeded = (e) => {
        const db = (e.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('chunks')) {
          db.createObjectStore('chunks', { keyPath: 'id' });
        }
      };
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }
  
  async addChunk(chunk: Chunk): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }
    const tx = this.db!.transaction('chunks', 'readwrite');
    await tx.objectStore('chunks').add(chunk);
    console.log(`💾 Added chunk to vector store: ${chunk.id}`);
  }
  
  async getChunkCount(): Promise<number> {
    if (!this.db) {
      await this.initialize();
    }
    const tx = this.db!.transaction('chunks', 'readonly');
    const store = tx.objectStore('chunks');
    return new Promise((resolve) => {
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
    });
  }
  
  async clear(): Promise<void> {
    console.log('🗑️ Clearing vector store...');
    
    // Initialize if not already initialized
    if (!this.db) {
      console.log('⚠️ Vector store not initialized, initializing now...');
      await this.initialize();
    }
    
    const tx = this.db!.transaction('chunks', 'readwrite');
    await tx.objectStore('chunks').clear();
    console.log('✅ Vector store cleared');
  }
  
  async search(
    queryEmbedding: number[], 
    topK = 5,
    useHybridSearch = false,
    queryText = ''
  ): Promise<SearchResult[]> {
    if (!this.db) {
      await this.initialize();
    }
    const tx = this.db!.transaction('chunks', 'readonly');
    const store = tx.objectStore('chunks');
    const allChunks: Chunk[] = [];
    
    return new Promise((resolve) => {
      store.openCursor().onsuccess = (e) => {
        const cursor = (e.target as IDBRequest).result;
        if (cursor) {
          allChunks.push(cursor.value);
          cursor.continue();
        } else {
          console.log(`🔍 Vector store search: Found ${allChunks.length} total chunks in database`);
          
          if (useHybridSearch && queryText) {
            console.log('🔀 Using hybrid search (semantic + keyword)');
            // Hybrid search: combine semantic and keyword scores
            const scored: SearchResult[] = allChunks.map(chunk => {
              const semanticScore = this.cosineSimilarity(queryEmbedding, chunk.embedding);
              const keywordScore = this.bm25Score(queryText, chunk.text, allChunks);
              // Weighted combination: 70% semantic, 30% keyword
              const hybridScore = (0.7 * semanticScore) + (0.3 * keywordScore);
              return {
                chunk,
                score: hybridScore
              };
            });
            scored.sort((a, b) => b.score - a.score);
            const results = scored.slice(0, topK);
            console.log(`✅ Hybrid search returning top ${results.length} chunks`);
            results.forEach((r, i) => {
              console.log(`  [${i+1}] Score: ${r.score.toFixed(3)}, Page: ${r.chunk.metadata?.['pageNumber'] || 'N/A'}`);
            });
            resolve(results);
          } else {
            // Standard semantic search
            const scored: SearchResult[] = allChunks.map(chunk => ({
              chunk,
              score: this.cosineSimilarity(queryEmbedding, chunk.embedding)
            }));
            scored.sort((a, b) => b.score - a.score);
            const results = scored.slice(0, topK);
            console.log(`✅ Semantic search returning top ${results.length} chunks`);
            results.forEach((r, i) => {
              console.log(`  [${i+1}] Score: ${r.score.toFixed(3)}, Page: ${r.chunk.metadata?.['pageNumber'] || 'N/A'}`);
            });
            resolve(results);
          }
        }
      };
    });
  }
  
  private cosineSimilarity(a: number[], b: number[]): number {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (magA * magB);
  }
  
  /**
   * Simplified BM25 scoring for keyword matching
   * Returns score between 0 and 1
   */
  private bm25Score(query: string, document: string, allDocuments: Chunk[]): number {
    const k1 = 1.5; // Term frequency saturation parameter
    const b = 0.75; // Length normalization parameter
    
    // Tokenize (simple lowercase split)
    const queryTokens = query.toLowerCase().split(/\s+/);
    const docTokens = document.toLowerCase().split(/\s+/);
    const docLength = docTokens.length;
    
    // Calculate average document length
    const avgDocLength = allDocuments.reduce((sum, chunk) => 
      sum + chunk.text.split(/\s+/).length, 0
    ) / allDocuments.length;
    
    let score = 0;
    
    for (const queryTerm of queryTokens) {
      // Term frequency in document
      const termFreq = docTokens.filter(t => t === queryTerm).length;
      
      if (termFreq === 0) continue;
      
      // Document frequency (how many documents contain this term)
      const docFreq = allDocuments.filter(chunk => 
        chunk.text.toLowerCase().includes(queryTerm)
      ).length;
      
      // IDF (Inverse Document Frequency)
      const idf = Math.log((allDocuments.length - docFreq + 0.5) / (docFreq + 0.5) + 1);
      
      // BM25 formula
      const numerator = termFreq * (k1 + 1);
      const denominator = termFreq + k1 * (1 - b + b * (docLength / avgDocLength));
      
      score += idf * (numerator / denominator);
    }
    
    // Normalize to 0-1 range (rough approximation)
    return Math.min(1, score / queryTokens.length);
  }
}
