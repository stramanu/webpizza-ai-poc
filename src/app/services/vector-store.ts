import { Injectable } from '@angular/core';

interface Chunk {
  id: string;
  text: string;
  embedding: number[];
  metadata?: Record<string, any>;
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
  
  async search(queryEmbedding: number[], topK = 5): Promise<Chunk[]> {
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
          // Cosine similarity
          const scored = allChunks.map(chunk => ({
            chunk,
            score: this.cosineSimilarity(queryEmbedding, chunk.embedding)
          }));
          scored.sort((a, b) => b.score - a.score);
          const results = scored.slice(0, topK).map(s => s.chunk);
          console.log(`✅ Returning top ${results.length} chunks (requested ${topK})`);
          resolve(results);
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
}
