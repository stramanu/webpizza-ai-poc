import { Injectable } from '@angular/core';
import * as webllm from '@mlc-ai/web-llm';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LlmClient {
  private engine: webllm.MLCEngine | null = null;
  private initProgress$ = new BehaviorSubject<string>('');
  private currentModel = 'Phi-3-mini-4k-instruct-q4f16_1-MLC';
  
  // Available models with their characteristics
  public readonly availableModels = [
    { 
      id: 'Phi-3-mini-4k-instruct-q4f16_1-MLC', 
      name: 'Phi-3 Mini (2GB)', 
      size: '~2GB',
      speed: 'Medium',
      quality: 'Good'
    },
    { 
      id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC', 
      name: 'Llama 3.2 1B (1GB)', 
      size: '~1GB',
      speed: 'Fast',
      quality: 'Good'
    },
    { 
      id: 'Llama-3.2-3B-Instruct-q4f16_1-MLC', 
      name: 'Llama 3.2 3B (1.5GB)', 
      size: '~1.5GB',
      speed: 'Medium-Fast',
      quality: 'Very Good'
    },
    { 
      id: 'Mistral-7B-Instruct-v0.3-q4f16_1-MLC', 
      name: 'Mistral 7B (4GB)', 
      size: '~4GB',
      speed: 'Slower',
      quality: 'Excellent'
    },
    { 
      id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC', 
      name: 'Qwen 2.5 1.5B (1GB)', 
      size: '~1GB',
      speed: 'Fast',
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
      'WebGPU is required for this demo.\n\n' +
      '❌ Issue: ' + reason + '\n\n' +
      '🎯 This is a proof-of-concept for 100% client-side AI.\n\n' +
      'Requirements:\n' +
      '✅ Chrome 113+ or Edge 113+ with WebGPU enabled\n' +
      '✅ Modern GPU (Intel HD 5500+, NVIDIA GTX 650+, AMD HD 7750+, Apple M1+)\n' +
      '✅ 4GB+ RAM available\n\n' +
      'Setup:\n' +
      '1. Open chrome://flags\n' +
      '2. Search "WebGPU"\n' +
      '3. Enable "Unsafe WebGPU"\n' +
      '4. Restart browser\n\n' +
      'Or use a modern browser with WebGPU support.\n' +
      'Check your browser: https://webgpureport.org/'
    );
    this.initProgress$.next('❌ WebGPU not available - ' + reason);
    throw error;
  }
  
  async initialize(): Promise<void> {
    // Check if WebGPU API exists and can get an adapter
    console.log('🔍 Checking WebGPU availability...');
    console.log('🔍 navigator object:', navigator);
    console.log('🔍 typeof navigator.gpu:', typeof (navigator as any).gpu);
    console.log('🔍 navigator.gpu exists:', 'gpu' in navigator);
    console.log('🔍 navigator.userAgent:', navigator.userAgent);
    
    if (!('gpu' in navigator)) {
      console.error('❌ navigator.gpu not found');
      console.error('❌ Available navigator properties:', Object.keys(navigator));
      this.throwWebGPUError('Navigator.gpu API not found');
      return;
    }
    
    try {
      const adapter = await (navigator as any).gpu.requestAdapter();
      if (!adapter) {
        console.error('❌ WebGPU adapter not available');
        this.throwWebGPUError('No WebGPU adapter available');
        return;
      }
      console.log('✅ WebGPU adapter found:', adapter);
    } catch (error) {
      console.error('❌ Error requesting WebGPU adapter:', error);
      this.throwWebGPUError('Failed to request WebGPU adapter: ' + error);
      return;
    }
    
    // Initialize with WebGPU
    const modelInfo = this.availableModels.find(m => m.id === this.currentModel);
    console.log(`🚀 Initializing WebLLM with ${modelInfo?.name || this.currentModel}...`);
    this.initProgress$.next(`Initializing ${modelInfo?.name || 'LLM'}...`);
    
    this.engine = await webllm.CreateMLCEngine(
      this.currentModel,
      { 
        initProgressCallback: (progress) => {
          console.log('LLM Progress:', progress.text);
          this.initProgress$.next(progress.text);
        },
        // Performance optimizations
        logLevel: 'WARN', // Reduce console overhead (default is 'INFO')
      }
    );
    
    console.log(`✅ WebGPU LLM ready! (${modelInfo?.name})`);
  }
  
  async generate(prompt: string, onToken?: (token: string) => void): Promise<string> {
    if (!this.engine) {
      throw new Error('LLM engine not initialized. WebGPU is required.');
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🤖 Starting LLM generation...');
    console.log('📝 Prompt length:', prompt.length, 'chars');
    console.log('⏱️  Start time:', new Date().toLocaleTimeString());
    
    const startTime = performance.now();
    let firstTokenTime: number | null = null;
    let fullResponse = '';
    let tokenCount = 0;
    let lastLogTime = startTime;
    
    const chunks = await this.engine.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 512,
      stream: true, // Enable streaming
      // Performance optimizations
      top_p: 0.9, // Nucleus sampling for faster generation
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    });
    
    console.log('📡 Stream started...');
    
    for await (const chunk of chunks) {
      const delta = chunk.choices[0]?.delta?.content || '';
      if (delta) {
        fullResponse += delta;
        tokenCount++;
        
        // Record time to first token
        if (tokenCount === 1) {
          firstTokenTime = performance.now();
          const ttft = ((firstTokenTime - startTime) / 1000).toFixed(2);
          console.log(`⚡ First token received in ${ttft}s (TTFT - Time To First Token)`);
        }
        
        // Log every 10 tokens with timing
        if (tokenCount % 10 === 0) {
          const now = performance.now();
          const elapsed = ((now - startTime) / 1000).toFixed(2);
          const tokensPerSec = (tokenCount / (now - startTime) * 1000).toFixed(2);
          console.log(`🔤 Token ${tokenCount} | ${elapsed}s elapsed | ${tokensPerSec} tokens/sec | Last: "${delta}"`);
          lastLogTime = now;
        }
        
        if (onToken) {
          onToken(fullResponse); // Send accumulated response
        }
      }
    }
    
    const endTime = performance.now();
    const totalTime = ((endTime - startTime) / 1000).toFixed(2);
    const avgTokensPerSec = firstTokenTime 
      ? (tokenCount / ((endTime - firstTokenTime) / 1000)).toFixed(2)
      : '0';
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Generation complete!');
    console.log('📊 Performance Metrics:');
    console.log(`   • Total tokens: ${tokenCount}`);
    console.log(`   • Total time: ${totalTime}s`);
    console.log(`   • Time to first token (TTFT): ${firstTokenTime ? ((firstTokenTime - startTime) / 1000).toFixed(2) : 'N/A'}s`);
    console.log(`   • Average speed: ${avgTokensPerSec} tokens/sec`);
    console.log(`   • Response length: ${fullResponse.length} chars`);
    console.log(`   • Model: ${this.currentModel}`);
    console.log('⏱️  End time:', new Date().toLocaleTimeString());
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return fullResponse;
  }
}