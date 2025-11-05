import { Injectable } from '@angular/core';
import { LlmClientWeInfer } from './llm-client-weinfer';
import { Embedder } from './embedder';
import { VectorStore } from './vector-store';
import { PdfParser } from './pdf-parser';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RagEngineWeInfer {
  constructor(
    public llm: LlmClientWeInfer,
    public embedder: Embedder,
    public vectorStore: VectorStore,
    public parser: PdfParser
  ) {}
  
  get progress(): Observable<string> {
    return this.llm.progress;
  }
  
  async initialize(): Promise<void> {
    console.log('🚀 [WeInfer] Initializing WebPizza RAG Engine with WeInfer...');
    
    // Initialize in sequence to show progress better
    console.log('1/3: [WeInfer] Initializing LLM with WeInfer optimizations...');
    await this.llm.initialize();
    
    console.log('2/3: [WeInfer] Initializing embedder (shared)...');
    await this.embedder.initialize();
    
    console.log('3/3: [WeInfer] Initializing vector store (shared)...');
    await this.vectorStore.initialize();
    
    console.log('✅ [WeInfer] RAG Engine ready with WeInfer optimizations!');
  }
  
  async ingest(file: File): Promise<void> {
    // 1. Parse PDF (shared parser)
    const chunks = await this.parser.parseFile(file);
    
    // 2. Embed + store (shared embedder & vector store)
    for (const [index, text] of chunks.entries()) {
      const embedding = await this.embedder.embed(text);
      await this.vectorStore.addChunk({
        id: `${file.name}-${index}`,
        text,
        embedding,
        metadata: { filename: file.name, chunkIndex: index }
      });
    }
  }
  
  async query(question: string, onToken?: (token: string) => void): Promise<string> {
    const ragStartTime = performance.now();
    console.log('🔍 [WeInfer] RAG Query started:', question);
    
    // Check vector store status
    const totalChunks = await this.vectorStore.getChunkCount();
    console.log(`📊 [WeInfer] Vector store contains ${totalChunks} chunks`);
    
    if (totalChunks === 0) {
      console.warn('⚠️ [WeInfer] Vector store is empty! Please upload a PDF document first.');
      return 'Please upload a PDF document first before asking questions.';
    }
    
    // 1. Embed question (shared embedder)
    console.log('1️⃣ [WeInfer] Embedding question...');
    const embedStart = performance.now();
    const queryEmbedding = await this.embedder.embed(question);
    const embedTime = ((performance.now() - embedStart) / 1000).toFixed(2);
    console.log(`✅ [WeInfer] Question embedded in ${embedTime}s, vector length:`, queryEmbedding.length);
    
    // 2. Search similar chunks (shared vector store)
    console.log('2️⃣ [WeInfer] Searching vector store...');
    const searchStart = performance.now();
    const relevantChunks = await this.vectorStore.search(queryEmbedding, 3);
    const searchTime = ((performance.now() - searchStart) / 1000).toFixed(2);
    console.log(`✅ [WeInfer] Found ${relevantChunks.length} relevant chunks in ${searchTime}s`);
    console.log('📄 Chunks:', relevantChunks.map((c, i) => `[${i}] ${c.text.substring(0, 50)}...`));
    
    // 3. Build context
    console.log('3️⃣ [WeInfer] Building context...');
    const context = relevantChunks.map(c => c.text).join('\n\n');
    console.log('✅ [WeInfer] Context length:', context.length, 'chars');
    
    // 4. Generate answer with WeInfer optimizations
    console.log('4️⃣ [WeInfer] Generating answer with WeInfer LLM (buffer reuse + async pipeline)...');
    const llmStart = performance.now();
    const prompt = `Context:\n${context}\n\nQuestion: ${question}\n\nAnswer:`;
    const answer = await this.llm.generate(prompt, onToken);
    const llmTime = ((performance.now() - llmStart) / 1000).toFixed(2);
    
    const totalTime = ((performance.now() - ragStartTime) / 1000).toFixed(2);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RAG Pipeline Performance (WeInfer):');
    console.log(`   • Embedding: ${embedTime}s`);
    console.log(`   • Vector search: ${searchTime}s`);
    console.log(`   • LLM generation (WeInfer): ${llmTime}s`);
    console.log(`   • Total RAG time: ${totalTime}s`);
    console.log(`   • Engine: WeInfer (buffer reuse + async pipeline)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return answer;
  }
}
