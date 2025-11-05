import { Injectable } from '@angular/core';
import { LlmClient } from './llm-client';
import { Embedder } from './embedder';
import { VectorStore } from './vector-store';
import { PdfParser } from './pdf-parser';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RagEngine {
  constructor(
    public llm: LlmClient,
    public embedder: Embedder,
    public vectorStore: VectorStore,
    public parser: PdfParser
  ) {}
  
  get progress(): Observable<string> {
    return this.llm.progress;
  }
  
  async initialize(): Promise<void> {
    console.log('🚀 Initializing WebPizza RAG Engine...');
    
    // Initialize in sequence to show progress better
    console.log('1/3: Initializing LLM...');
    await this.llm.initialize();
    
    console.log('2/3: Initializing embedder...');
    await this.embedder.initialize();
    
    console.log('3/3: Initializing vector store...');
    await this.vectorStore.initialize();
    
    console.log('✅ RAG Engine ready!');
  }
  
  async ingest(file: File): Promise<void> {
    // 1. Parse PDF
    const chunks = await this.parser.parseFile(file);
    
    // 2. Embed + store
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
    console.log('🔍 RAG Query started:', question);
    
    // Check vector store status
    const totalChunks = await this.vectorStore.getChunkCount();
    console.log(`📊 Vector store contains ${totalChunks} chunks`);
    
    if (totalChunks === 0) {
      console.warn('⚠️ Vector store is empty! Please upload a PDF document first.');
      return 'Please upload a PDF document first before asking questions.';
    }
    
    // 1. Embed question
    console.log('1️⃣ Embedding question...');
    const embedStart = performance.now();
    const queryEmbedding = await this.embedder.embed(question);
    const embedTime = ((performance.now() - embedStart) / 1000).toFixed(2);
    console.log(`✅ Question embedded in ${embedTime}s, vector length:`, queryEmbedding.length);
    
    // 2. Search similar chunks
    console.log('2️⃣ Searching vector store...');
    const searchStart = performance.now();
    const relevantChunks = await this.vectorStore.search(queryEmbedding, 3);
    const searchTime = ((performance.now() - searchStart) / 1000).toFixed(2);
    console.log(`✅ Found ${relevantChunks.length} relevant chunks in ${searchTime}s`);
    console.log('📄 Chunks:', relevantChunks.map((c, i) => `[${i}] ${c.text.substring(0, 50)}...`));
    
    // 3. Build context
    console.log('3️⃣ Building context...');
    const context = relevantChunks.map(c => c.text).join('\n\n');
    console.log('✅ Context length:', context.length, 'chars');
    
    // 4. Generate answer
    console.log('4️⃣ Generating answer with LLM...');
    const llmStart = performance.now();
    const prompt = `Context:\n${context}\n\nQuestion: ${question}\n\nAnswer:`;
    const answer = await this.llm.generate(prompt, onToken);
    const llmTime = ((performance.now() - llmStart) / 1000).toFixed(2);
    
    const totalTime = ((performance.now() - ragStartTime) / 1000).toFixed(2);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RAG Pipeline Performance:');
    console.log(`   • Embedding: ${embedTime}s`);
    console.log(`   • Vector search: ${searchTime}s`);
    console.log(`   • LLM generation: ${llmTime}s`);
    console.log(`   • Total RAG time: ${totalTime}s`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return answer;
  }
}
