# 🍕 WebPizza RAG POC

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://webpizza-ai-poc.vercel.app/)
> **🚀 Live Demo**: [https://webpizza-ai-poc.vercel.app/](https://webpizza-ai-poc.vercel.app/)
>
> **⚠️ Experimental POC**: This is a proof-of-concept for testing purposes only. It may contain bugs and errors. Loosely inspired by [DataPizza AI](https://github.com/datapizza-labs/datapizza-ai).

**100% Client-Side AI Document Chat** - No servers, no APIs, complete privacy.

Chat with your PDF documents using AI that runs entirely in your browser via WebGPU.

## ✨ Features

- 🔒 **100% Private**: All processing happens in your browser - your documents never leave your device
- ⚡ **Dual Engine**: Choose between standard WebLLM or optimized WeInfer (~3.76x faster)
- 🤖 **Multiple Models**: Phi-3, Llama 3, Mistral 7B, Qwen, Gemma
- 📄 **PDF Support**: Upload and chat with your PDF documents
- 🎯 **RAG Pipeline**: Advanced retrieval-augmented generation with vector search
- 💾 **Local Storage**: Documents cached in IndexedDB for instant access
- 🚀 **WebGPU Accelerated**: Leverage your GPU for fast inference

## 🛠️ Tech Stack

- **Frontend**: Angular 20
- **LLM Engines**: 
  - WebLLM v0.2.79 (Standard)
  - WeInfer v0.2.43 (Optimized with buffer reuse + async pipeline)
- **Embeddings**: Transformers.js (all-MiniLM-L6-v2)
- **PDF Parsing**: PDF.js v5.4.296
- **Vector Store**: IndexedDB with cosine similarity
- **Compute**: WebGPU / WebAssembly

## 🚀 Quick Start

### Prerequisites

- Modern browser with WebGPU support (Chrome 113+, Edge 113+)
- 4GB+ RAM available
- Modern GPU (Intel HD 5500+, NVIDIA GTX 650+, AMD HD 7750+, Apple M1+)

### Development

```bash
# Install dependencies
npm install

# Start dev server
npm start

# Build for production
npm run build
```

### Enable WebGPU (if needed)

1. Open `chrome://flags` or `edge://flags`
2. Search for "WebGPU"
3. Enable "Unsafe WebGPU"
4. Restart browser

Check your browser: https://webgpureport.org/

## 📖 Usage

1. **Select Engine**: Choose between WebLLM (standard) or WeInfer (optimized)
2. **Choose Model**: Select an LLM based on your hardware capabilities
3. **Upload PDF**: Drop your document (first load downloads model ~1-4GB)
4. **Ask Questions**: Chat with your document using natural language

## 🔒 Privacy

- ❌ No data collection
- ❌ No server uploads
- ❌ No tracking cookies
- ❌ No analytics
- ✅ 100% client-side processing
- ✅ Your data never leaves your device

See our [Privacy Policy](/privacy-policy) and [Cookie Policy](/cookie-policy) for details.

## ⚡ Performance

### WebLLM (Standard)
- Phi-3 Mini: ~3-6 tokens/sec
- Llama 3.2 1B: ~8-12 tokens/sec
- Mistral 7B: ~2-4 tokens/sec

### WeInfer (Optimized)
- **~3.76x faster** across all models
- Buffer reuse optimization
- Asynchronous pipeline processing
- GPU sampling optimization

## 📦 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

The project includes `vercel.json` with optimal configuration for WebGPU and routing.

### Other Platforms

Ensure your hosting supports:
- SPA routing (all routes → index.html)
- Cross-Origin headers for WebGPU:
  - `Cross-Origin-Embedder-Policy: require-corp`
  - `Cross-Origin-Opener-Policy: same-origin`

## 🎯 Browser Compatibility

| Browser | Version | WebGPU Support |
|---------|---------|----------------|
| Chrome | 113+ | ✅ Full Support |
| Edge | 113+ | ✅ Full Support |
| Safari | 18+ | ⚠️ Experimental |
| Firefox | - | ❌ Not Yet |

## 🔧 Configuration

### Available Models (WebLLM)

```typescript
- Phi-3-mini-4k-instruct-q4f16_1-MLC (~2GB)
- Llama-3.2-1B-Instruct-q4f16_1-MLC (~1GB)
- Llama-3.2-3B-Instruct-q4f16_1-MLC (~1.5GB)
- Mistral-7B-Instruct-v0.3-q4f16_1-MLC (~4GB)
- Qwen2.5-1.5B-Instruct-q4f16_1-MLC (~1GB)
```

### Available Models (WeInfer)

```typescript
- Phi-3-mini-4k-instruct-q4f16_1-MLC (~2GB)
- Qwen2-1.5B-Instruct-q4f16_1-MLC (~1GB)
- Mistral-7B-Instruct-v0.3-q4f16_1-MLC (~4GB)
- Llama-3-8B-Instruct-q4f16_1-MLC (~4GB)
- gemma-2b-it-q4f16_1-MLC (~1.2GB)
```

## 🐛 Troubleshooting

### WebGPU Not Available

1. Check browser version (Chrome/Edge 113+)
2. Enable `chrome://flags#enable-unsafe-webgpu`
3. Update graphics drivers
4. Test at https://webgpureport.org/

### Slow Performance

- Try a smaller model (Llama 1B, Qwen)
- Use WeInfer engine for 3.76x speedup
- Close other tabs/applications
- Check GPU isn't throttling

### Out of Memory

- Use smaller models
- Close other browser tabs
- Increase browser memory limit
- Clear browser cache and restart

## 🤝 Contributing

This is a proof-of-concept project. Contributions, issues, and feature requests are welcome!

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

## 👤 Author

**Emanuele Strazzullo**

- Website: [emanuelestrazzullo.dev](https://emanuelestrazzullo.dev/)
- LinkedIn: [linkedin.com/in/emanuelestrazzullo](https://www.linkedin.com/in/emanuelestrazzullo/)

## 🙏 Acknowledgments

- [MLC LLM](https://github.com/mlc-ai/web-llm) - WebLLM inference engine
- [WeInfer](https://github.com/csAugust/WeInfer) - Optimized WebLLM fork
- [Transformers.js](https://github.com/xenova/transformers.js) - Browser ML library
- [PDF.js](https://github.com/mozilla/pdf.js) - PDF parsing
- [Hugging Face](https://huggingface.co/) - Model hosting

---

Made with ❤️ by [Emanuele Strazzullo](https://emanuelestrazzullo.dev/)
