import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RagEngine } from '../services/rag-engine';
import { RagEngineWeInfer } from '../services/rag-engine-weinfer';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  loading = false; // Don't auto-load, wait for model selection
  uploading = false;
  querying = false;
  question = '';
  answer = '';
  initProgress = '';
  showBrowserError = false;
  browserErrorDetails = '';
  isModelLoaded = false;
  selectedModel = ''; // Empty by default - user must choose
  selectedEngine: 'webllm' | 'weinfer' = 'webllm'; // Default to standard WebLLM
  availableModels: any[] = [];
  loadingProgress = 0; // 0-100
  currentStep = 0; // 0=not started, 1=LLM, 2=Embedder, 3=VectorStore, 4=Complete
  uploadProgress = 0; // 0-100
  uploadStatus = '';
  uploadFileName = '';
  loadedDocumentName = ''; // Name of the loaded PDF
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  
  // RAG Feature Flags
  enableSourceCitations = false;
  enableConversationalMemory = false;
  enableHybridSearch = false;
  
  // Conversation History
  conversationHistory: Array<{question: string; answer: string}> = [];
  
  constructor(
    private ragStandard: RagEngine,
    private ragWeInfer: RagEngineWeInfer,
    private cdr: ChangeDetectorRef
  ) {
    this.updateAvailableModels();
  }
  
  // Dynamic getter for current RAG engine
  get rag(): RagEngine | RagEngineWeInfer {
    return this.selectedEngine === 'weinfer' ? this.ragWeInfer : this.ragStandard;
  }
  
  private updateAvailableModels(): void {
    this.availableModels = this.selectedEngine === 'weinfer' 
      ? this.ragWeInfer.llm.availableModels 
      : this.ragStandard.llm.availableModels;
  }
  
  onEngineChange(): void {
    if (this.isModelLoaded) {
      this.showToastNotification('Engine already loaded. Refresh page to change engine.', 'error');
      // Revert selection
      this.selectedEngine = this.selectedEngine === 'weinfer' ? 'webllm' : 'weinfer';
      this.cdr.detectChanges();
      return;
    }
    
    console.log(`🔄 Switched to ${this.selectedEngine === 'weinfer' ? 'WeInfer' : 'WebLLM'} engine`);
    this.updateAvailableModels();
    this.selectedModel = ''; // Reset model selection
    this.cdr.detectChanges();
  }
  
  private checkBrowserCapabilities(): { supported: boolean; message: string } {
    // Check WebGPU
    const hasWebGPU = 'gpu' in navigator;
    
    // Check WebAssembly
    const hasWasm = typeof WebAssembly !== 'undefined';
    
    if (hasWebGPU) {
      return { supported: true, message: 'WebGPU detected - will use GPU acceleration' };
    } else if (hasWasm) {
      return { supported: true, message: 'WebGPU not found - will use CPU mode (slower)' };
    } else {
      return { 
        supported: false, 
        message: 'Browser not supported - WebGPU and WebAssembly are both unavailable' 
      };
    }
  }
  
  async ngOnInit() {
    // Check browser capabilities first
    const capabilities = this.checkBrowserCapabilities();
    
    if (!capabilities.supported) {
      this.showBrowserError = true;
      this.browserErrorDetails = capabilities.message;
      return;
    }
    
    console.log('✅', capabilities.message);
    // Don't auto-initialize, wait for model selection confirmation
  }
  
  async onModelChange() {
    if (this.isModelLoaded) {
      this.showToastNotification('Model already loaded. Refresh page to change model.', 'error');
      return;
    }
    
    // Check if a valid model was selected
    if (!this.selectedModel || this.selectedModel === '') {
      return;
    }
    
    // Set the selected model
    this.rag.llm.setModel(this.selectedModel);
    
    // Start loading
    this.loading = true;
    this.loadingProgress = 0;
    this.currentStep = 1;
    this.cdr.detectChanges();
    
    try {
      // Subscribe to progress updates for LLM
      this.rag.llm.progress.subscribe((progress: string) => {
        if (progress) {
          console.log('LLM progress:', progress);
          this.initProgress = `[LLM] ${progress}`;
          
          // Check if loading from cache (no percentage, just status messages)
          if (progress.includes('Loading model from cache') || 
              progress.includes('loading from cache') ||
              progress.includes('Compiling') ||
              progress.includes('Initializing')) {
            // Simulate progress for cached loading (smoother UX)
            const currentProgress = this.loadingProgress;
            if (currentProgress < 65) {
              this.loadingProgress = Math.min(65, currentProgress + 5);
            }
          } else if (progress.includes('%')) {
            // Parse progress from download messages
            const match = progress.match(/(\d+)%/);
            if (match) {
              const percent = parseInt(match[1]);
              // LLM is 70% of total progress
              this.loadingProgress = Math.floor(percent * 0.7);
            }
          } else {
            // Generic progress increment for other messages
            const currentProgress = this.loadingProgress;
            if (currentProgress < 65) {
              this.loadingProgress = Math.min(65, currentProgress + 2);
            }
          }
          
          this.cdr.detectChanges();
        }
      });
      
      // Subscribe to embedder progress
      this.rag.embedder.progress.subscribe((progress: string) => {
        if (progress) {
          console.log('Embedder progress:', progress);
          this.initProgress = `[Embedder] ${progress}`;
          
          // Check for cached loading
          if (progress.includes('cache') || progress.includes('loaded')) {
            const currentProgress = this.loadingProgress;
            if (currentProgress >= 70 && currentProgress < 88) {
              this.loadingProgress = Math.min(88, currentProgress + 3);
            }
          } else if (progress.includes('%')) {
            const match = progress.match(/(\d+)%/);
            if (match) {
              const percent = parseInt(match[1]);
              // Embedder is 20% of total progress (starting at 70%)
              this.loadingProgress = Math.floor(70 + (percent * 0.2));
            }
          } else {
            // Generic progress for embedder
            const currentProgress = this.loadingProgress;
            if (currentProgress >= 70 && currentProgress < 88) {
              this.loadingProgress = Math.min(88, currentProgress + 2);
            }
          }
          
          this.cdr.detectChanges();
        }
      });
      
      // Initialize RAG engine with selected model
      console.log('🚀 Starting initialization...');
      
      // Step 1: LLM
      this.currentStep = 1;
      this.initProgress = 'Initializing LLM...';
      this.loadingProgress = 5; // Start at 5% to show activity
      this.cdr.detectChanges();
      
      await this.rag.llm.initialize();
      
      // Ensure we're at least at 70% after LLM
      if (this.loadingProgress < 70) {
        this.loadingProgress = 70;
      }
      console.log('✅ LLM ready');
      this.cdr.detectChanges();
      
      // Step 2: Embedder
      this.currentStep = 2;
      this.initProgress = 'Initializing embedder...';
      this.cdr.detectChanges();
      
      await this.rag.embedder.initialize();
      
      // Ensure we're at least at 90% after embedder
      if (this.loadingProgress < 90) {
        this.loadingProgress = 90;
      }
      console.log('✅ Embedder ready');
      this.cdr.detectChanges();
      
      // Step 3: Vector Store
      this.currentStep = 3;
      this.initProgress = 'Initializing vector store...';
      this.cdr.detectChanges();
      
      await this.rag.vectorStore.initialize();
      
      this.loadingProgress = 100;
      console.log('✅ Vector store ready');
      this.cdr.detectChanges();
      
      // Complete
      this.currentStep = 4;
      this.initProgress = '✅ All systems ready!';
      
      // Small delay to show 100% before hiding
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('✅ RAG initialization complete');
      this.loading = false;
      this.isModelLoaded = true;
      this.cdr.detectChanges();
    } catch (error) {
      console.error('❌ Initialization error:', error);
      this.loading = false;
      this.showBrowserError = true;
      this.browserErrorDetails = (error as Error).message;
      this.cdr.detectChanges();
    }
  }
  
  getCurrentModelName(): string {
    const model = this.availableModels.find(m => m.id === this.selectedModel);
    return model?.name || this.selectedModel;
  }
  
  async onFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      this.uploading = true;
      this.uploadFileName = file.name;
      this.uploadProgress = 0;
      this.uploadStatus = 'Starting...';
      this.cdr.detectChanges();
      
      try {
        // Clear previous document from vector store
        this.uploadStatus = '🗑️ Clearing previous data...';
        this.uploadProgress = 5;
        this.cdr.detectChanges();
        await this.rag.vectorStore.clear();
        
        // Parse PDF
        this.uploadStatus = '📖 Parsing PDF...';
        this.uploadProgress = 10;
        this.cdr.detectChanges();
        
        const chunks = await this.rag.parser.parseFile(file);
        this.uploadProgress = 30;
        this.uploadStatus = `✂️ Split into ${chunks.length} chunks`;
        this.cdr.detectChanges();
        
        console.log(`📄 PDF parsed: ${chunks.length} chunks`);
        
        // Embed and store chunks
        const totalChunks = chunks.length;
        for (const [index, chunk] of chunks.entries()) {
          const chunkNum = index + 1;
          this.uploadStatus = `🔢 Embedding chunk ${chunkNum}/${totalChunks}...`;
          this.uploadProgress = 30 + Math.floor((index / totalChunks) * 60);
          this.cdr.detectChanges();
          
          const embedding = await this.rag.embedder.embed(chunk.text);
          
          await this.rag.vectorStore.addChunk({
            id: `${file.name}-${index}`,
            text: chunk.text,
            embedding,
            metadata: { 
              filename: file.name, 
              chunkIndex: chunk.chunkIndex,
              pageNumber: chunk.pageNumber
            }
          });
        }
        
        this.uploadProgress = 100;
        this.uploadStatus = '✅ Complete!';
        this.loadedDocumentName = file.name; // Save loaded document name
        this.cdr.detectChanges();
        
        // Show success toast
        this.showToastNotification(`Document "${file.name}" ingested successfully!`, 'success');
        
      } catch (error) {
        console.error('❌ Ingestion error:', error);
        this.showToastNotification('Error ingesting document. Check console for details.', 'error');
      } finally {
        // Small delay before hiding progress
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.uploading = false;
        input.value = ''; // Reset input
        this.cdr.detectChanges();
      }
    }
  }
  
  showToastNotification(message: string, type: 'success' | 'error') {
    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;
    this.cdr.detectChanges();
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
      this.showToast = false;
      this.cdr.detectChanges();
    }, 4000);
  }
  
  async onQuery() {
    if (!this.question.trim()) return;
    
    this.querying = true;
    this.answer = '';
    
    const currentQuestion = this.question;
    console.log('🚀 Starting query:', currentQuestion);
    
    try {
      // Pass conversation history if memory is enabled
      const conversationContext = this.enableConversationalMemory 
        ? this.conversationHistory 
        : [];
      
      // Stream tokens in real-time
      await this.rag.query(
        currentQuestion, 
        (partialAnswer: string) => {
          this.answer = partialAnswer;
          this.cdr.detectChanges(); // Update UI with each token
        },
        conversationContext,
        this.enableHybridSearch,
        this.enableSourceCitations
      );
      
      // Save to conversation history if memory is enabled
      if (this.enableConversationalMemory && this.answer) {
        this.conversationHistory.push({
          question: currentQuestion,
          answer: this.answer
        });
        console.log(`💭 Conversation history: ${this.conversationHistory.length} exchanges`);
      }
      
      console.log('✅ Query complete!');
    } catch (error) {
      console.error('❌ Query error:', error);
      this.answer = '❌ Error querying document. Make sure you have uploaded a PDF first.';
    } finally {
      this.querying = false;
      this.cdr.detectChanges();
    }
  }
  
  clearConversation(): void {
    this.conversationHistory = [];
    this.question = '';
    this.answer = '';
    console.log('🗑️ Conversation history cleared');
    this.showToastNotification('Conversation history cleared', 'success');
  }
  
  getBrowserInfo(): string {
    return navigator.userAgent;
  }
}