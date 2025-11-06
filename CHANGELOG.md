# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2025-11-06

### Added
- **Conversational Memory**: Remember previous Q&A exchanges for follow-up questions
  - Conversation history tracking in component state
  - Context injection into LLM prompts
  - "Clear Conversation" button to reset history
  - Exchange counter display
- **Hybrid Search**: Combine semantic vector search with keyword matching
  - BM25 algorithm implementation for keyword scoring
  - Weighted fusion: 70% semantic + 30% keyword
  - Better retrieval for exact term matches
  - UI toggle for hybrid vs semantic-only search

### Changed
- All three RAG features (Source Citations, Conversational Memory, Hybrid Search) now fully functional
- Enhanced RAG engine query methods to support conversation history
- Updated vector store search to support hybrid mode
- Improved logging for hybrid search scoring

### Fixed
- Source Citations flag now correctly controls citation behavior in responses
- Context formatting and prompt instructions now respect enableSourceCitations flag

## [0.2.0] - 2025-11-06

### Added
- **Source Citations**: Added optional feature to display page numbers in AI responses
  - New RAG Options section with toggleable features
  - Page number tracking through PDF parsing pipeline
  - Enhanced context formatting with source citations
  - UI checkbox to enable/disable citations
- Model selection validation - prevent file upload before model is loaded
- Better error handling for uninitialized embedder

### Fixed
- PDF.js version mismatch error by dynamically matching worker version
- Service worker cache clearing to prevent version conflicts
- Upload disabled state until model initialization completes

### Changed
- Improved user feedback for model loading requirements
- Enhanced error messages with clear instructions

## [0.1.0] - 2025-11-05

### Added
- **Source Citations**: Added optional feature to display page numbers in AI responses
  - New RAG Options section with toggleable features
  - Page number tracking through PDF parsing pipeline
  - Enhanced context formatting with source citations
  - UI checkbox to enable/disable citations
- Model selection validation - prevent file upload before model is loaded
- Better error handling for uninitialized embedder

### Fixed
- PDF.js version mismatch error by dynamically matching worker version
- Service worker cache clearing to prevent version conflicts
- Upload disabled state until model initialization completes

### Changed
- Improved user feedback for model loading requirements
- Enhanced error messages with clear instructions

## [0.1.0] - 2025-11-05

### Added
- Initial release of WebPizza AI/RAG POC
- 100% client-side RAG implementation with Angular 20
- Dual engine support: WebLLM (standard) and WeInfer (optimized)
- Multiple LLM model options (Phi-3, Llama 3.2, Mistral, Qwen)
- PDF document ingestion with chunking
- Vector similarity search using IndexedDB
- Real-time streaming responses
- WebGPU acceleration support
- Privacy-focused: all processing happens locally
- Responsive UI with progress indicators
- Browser compatibility detection
- Legal pages (Privacy Policy, Cookie Policy)
- Vercel deployment configuration
- Cross-Origin-Isolation headers for WebGPU support

### Technical Stack
- Angular 20 (standalone components, zoneless)
- WebLLM v0.2.79 + WeInfer v0.2.43
- Transformers.js v2.17.2 (all-MiniLM-L6-v2 embeddings)
- PDF.js v5.4.296
- IndexedDB for vector storage
- WebGPU/WebAssembly for inference

[0.3.0]: https://github.com/stramanu/webpizza-ai-poc/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/stramanu/webpizza-ai-poc/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/stramanu/webpizza-ai-poc/releases/tag/v0.1.0
