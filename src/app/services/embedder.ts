import { Injectable } from '@angular/core';
import { pipeline, env } from '@xenova/transformers';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Embedder {
  private pipe: any;
  private progress$ = new BehaviorSubject<string>('');
  
  get progress(): Observable<string> {
    return this.progress$.asObservable();
  }
  
  constructor() {
    // Configure Transformers.js to use HuggingFace CDN
    env.allowRemoteModels = true;
    env.allowLocalModels = false;
    
    // Use CDN for models (no local download needed)
    env.backends.onnx.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@latest/dist/';
  }
  
  async initialize(): Promise<void> {
    console.log('🔢 Initializing embedder (all-MiniLM-L6-v2)...');
    this.progress$.next('Loading embedder model...');
    
    this.pipe = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2',
      { 
        // Force remote model loading
        quantized: true,
        progress_callback: (progress: any) => {
          if (progress.status === 'downloading') {
            const percent = Math.round(progress.progress || 0);
            const message = `Downloading embedder: ${progress.file} (${percent}%)`;
            console.log(message);
            this.progress$.next(message);
          } else if (progress.status === 'done') {
            this.progress$.next('Embedder loaded ✓');
          }
        }
      }
    );
    
    console.log('✅ Embedder ready!');
  }
  
  async embed(text: string): Promise<number[]> {
    console.log('🔢 Embedding text:', text.substring(0, 100) + '...');
    const startTime = Date.now();
    
    const output = await this.pipe(text, { 
      pooling: 'mean', 
      normalize: true 
    });
    
    const duration = Date.now() - startTime;
    console.log(`✅ Embedding complete in ${duration}ms`);
    
    return Array.from(output.data);
  }
}