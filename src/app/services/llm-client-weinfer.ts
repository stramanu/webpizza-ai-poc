import { Injectable } from '@angular/core';
import * as webllm from '../../lib/weinfer/index'; // WeInfer optimized library
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LlmClientWeInfer {
  private engine: webllm.MLCEngine | null = null;
  private initProgress$ = new BehaviorSubject<string>('');
  private currentModel = 'Phi-3-mini-4k-instruct-q4f16_1-MLC';
  
  // Available models with their characteristics (WeInfer v0.2.43 compatible)
  public readonly availableModels = [
    { 
      id: 'Phi-3-mini-4k-instruct-q4f16_1-MLC', 
      name: 'Phi-3 Mini (2GB) [WeInfer]', 
      size: '~2GB',
      speed: 'Fast (3.76x)',
      quality: 'Good'
    },
    { 
      id: 'Qwen2-1.5B-Instruct-q4f16_1-MLC', 
      name: 'Qwen2 1.5B (1GB) [WeInfer]', 
      size: '~1GB',
      speed: 'Very Fast (3.76x)',
      quality: 'Good'
    },
    { 
      id: 'Mistral-7B-Instruct-v0.3-q4f16_1-MLC', 
      name: 'Mistral 7B v0.3 (4GB) [WeInfer]', 
      size: '~4GB',
      speed: 'Medium (3.76x)',
      quality: 'Excellent'
    },
    { 
      id: 'Llama-3-8B-Instruct-q4f16_1-MLC', 
      name: 'Llama 3 8B (4GB) [WeInfer]', 
      size: '~4GB',
      speed: 'Medium (3.76x)',
      quality: 'Excellent'
    },
    { 
      id: 'gemma-2b-it-q4f16_1-MLC', 
      name: 'Gemma 2B (1.2GB) [WeInfer]', 
      size: '~1.2GB',
      speed: 'Fast (3.76x)',
      quality: 'Good'
    }
  ];
  
  get progress(): Observable<string> {
    return this.initProgress$.asObservable();
  }
  
  setModel(modelId: string): void {
    this.currentModel = modelId;
  }
  
  getCurrentModel(): string {
    return this.currentModel;
  }
  
  private throwWebGPUError(reason: string): void {
    const error = new Error(
      'WebGPU is required for WeInfer engine.\n\n' +
      '❌ Issue: ' + reason + '\n\n' +
      '🚀 WeInfer requires the same WebGPU support as standard WebLLM.\n\n' +
      'Requirements:\n' +
      '✅ Chrome 113+ or Edge 113+ with WebGPU enabled\n' +
      '✅ Modern GPU (Intel HD 5500+, NVIDIA GTX 650+, AMD HD 7750+, Apple M1+)\n' +
      '✅ 4GB+ RAM available\n\n' +
      'Setup:\n' +
      '1. Open chrome://flags\n' +
      '2. Search "WebGPU"\n' +
      '3. Enable "Unsafe WebGPU"\n' +
      '4. Restart browser\n\n' +
      'Check your browser: https://webgpureport.org/'
    );
    this.initProgress$.next('❌ WebGPU not available - ' + reason);
    throw error;
  }
  
  async initialize(): Promise<void> {
    // Check if WebGPU API exists and can get an adapter
    console.log('🔍 [WeInfer] Checking WebGPU availability...');
    
    if (!('gpu' in navigator)) {
      console.error('❌ [WeInfer] navigator.gpu not found');
      this.throwWebGPUError('Navigator.gpu API not found');
      return;
    }
    
    try {
      const adapter = await (navigator as any).gpu.requestAdapter();
      if (!adapter) {
        console.error('❌ [WeInfer] WebGPU adapter not available');
        this.throwWebGPUError('No WebGPU adapter available');
        return;
      }
      console.log('✅ [WeInfer] WebGPU adapter found:', adapter);
    } catch (error) {
      console.error('❌ [WeInfer] Error requesting WebGPU adapter:', error);
      this.throwWebGPUError('Failed to request WebGPU adapter: ' + error);
      return;
    }
    
    // Initialize with WeInfer optimizations
    const modelInfo = this.availableModels.find(m => m.id === this.currentModel);
    console.log(`🚀 [WeInfer] Initializing with ${modelInfo?.name || this.currentModel}...`);
    console.log('⚡ [WeInfer] Using optimized buffer reuse + async pipeline');
    this.initProgress$.next(`Initializing ${modelInfo?.name || 'LLM'} with WeInfer...`);
    
    this.engine = await webllm.CreateMLCEngine(
      this.currentModel,
      { 
        initProgressCallback: (progress) => {
          console.log('[WeInfer] LLM Progress:', progress.text);
          this.initProgress$.next(progress.text);
        },
        // Performance optimizations (same as standard + WeInfer internals)
        logLevel: 'WARN',
      }
    );
    
    console.log(`✅ [WeInfer] WebGPU LLM ready! (${modelInfo?.name})`);
    console.log('⚡ [WeInfer] Expecting ~3.76x speedup over standard WebLLM');
  }
  
  async generate(prompt: string, onToken?: (token: string) => void): Promise<string> {
    if (!this.engine) {
      throw new Error('[WeInfer] LLM engine not initialized. WebGPU is required.');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🤖 [WeInfer] Starting LLM generation...');
    console.log('⚡ [WeInfer] Using optimized buffer reuse + async pipeline');
    console.log('📝 Prompt length:', prompt.length, 'chars');
    console.log('⏱️  Start time:', new Date().toLocaleTimeString());
    
    const startTime = performance.now();
    let firstTokenTime: number | null = null;
    let fullResponse = '';
    let tokenCount = 0;
    
    const chunks = await this.engine.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 512,
      stream: true,
      // Performance optimizations
      top_p: 0.9,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    });
    
    console.log('📡 [WeInfer] Stream started...');
    
    for await (const chunk of chunks) {
      const delta = chunk.choices[0]?.delta?.content || '';
      if (delta) {
        fullResponse += delta;
        tokenCount++;
        
        // Record time to first token
        if (tokenCount === 1) {
          firstTokenTime = performance.now();
          const ttft = ((firstTokenTime - startTime) / 1000).toFixed(2);
          console.log(`⚡ [WeInfer] First token received in ${ttft}s (TTFT)`);
        }
        
        // Log every 10 tokens with timing
        if (tokenCount % 10 === 0) {
          const now = performance.now();
          const elapsed = ((now - startTime) / 1000).toFixed(2);
          const tokensPerSec = (tokenCount / (now - startTime) * 1000).toFixed(2);
          console.log(`🔤 [WeInfer] Token ${tokenCount} | ${elapsed}s elapsed | ${tokensPerSec} tokens/sec | Last: "${delta}"`);
        }
        
        if (onToken) {
          onToken(fullResponse);
        }
      }
    }
    
    const endTime = performance.now();
    const totalTime = ((endTime - startTime) / 1000).toFixed(2);
    const avgTokensPerSec = firstTokenTime 
      ? (tokenCount / ((endTime - firstTokenTime) / 1000)).toFixed(2)
      : '0';
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ [WeInfer] Generation complete!');
    console.log('📊 Performance Metrics (WeInfer):');
    console.log(`   • Total tokens: ${tokenCount}`);
    console.log(`   • Total time: ${totalTime}s`);
    console.log(`   • Time to first token (TTFT): ${firstTokenTime ? ((firstTokenTime - startTime) / 1000).toFixed(2) : 'N/A'}s`);
    console.log(`   • Average speed: ${avgTokensPerSec} tokens/sec`);
    console.log(`   • Response length: ${fullResponse.length} chars`);
    console.log(`   • Model: ${this.currentModel}`);
    console.log(`   • Engine: WeInfer (buffer reuse + async pipeline)`);
    console.log('⏱️  End time:', new Date().toLocaleTimeString());
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return fullResponse;
  }
}
