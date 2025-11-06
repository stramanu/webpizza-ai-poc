# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2025-11-06

### Added
- **Chat Interface**: Complete UI/UX transformation to conversational chat interface
  - Modern chat bubbles (user: orange/right, assistant: gray/left)
  - Real-time message streaming with auto-scroll
  - Typing indicator with animated dots during generation
  - Message timestamps and source page badges
  - Empty state with instructions when no messages
  - Collapsible setup section to maximize chat space
  - Fixed input at bottom for easy access
- **Stop Generation**: Added ability to interrupt AI response generation
  - Red stop button (⏹) appears during generation
  - Graceful interruption preserves partial response
  - Immediate UI feedback when stopped
- **Improved Loading UX**: Fixed progress tracking for first-time model downloads
  - Progress subscriptions now registered before initialization
  - Real-time progress updates visible in UI
  - Accurate percentage display during model download
- **Enhanced PDF Upload Feedback**: Detailed progress during document ingestion
  - Shows text preview of each chunk being embedded
  - Real-time display of chunk number and content being processed
  - Better visibility into embedding progress (similar to LLM loading)

### Changed
- Completely redesigned interface from form-based to chat-based interaction
- Reduced header/footer spacing to maximize chat area
- Optimized card padding and margins for compact layout
- Enhanced scroll behavior with proper flex layout
- Setup section now collapsible with smooth animation

### Fixed
- Progress bar stuck at 5% during first model load
- Scroll container not working correctly in chat interface
- Layout overflow issues with flexbox hierarchy
- Auto-scroll timing during message streaming
- **Response streaming freeze**: Fixed UI not updating when generation completes
  - Added final synchronization between streaming answer and chat message
  - Enhanced change detection to ensure UI reflects completed response
  - Improved error handling and logging for streaming edge cases
  - Guaranteed `querying` flag reset in finally block

### UI/UX Improvements
- Chat layout uses full viewport height
- Message bubbles with max-width 75% for readability
- Smooth animations for message appearance
- Visual distinction between user and assistant messages
- Sources displayed as inline badges in message metadata
- Send button transforms to Stop button during generation

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

[0.4.0]: https://github.com/stramanu/webpizza-ai-poc/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/stramanu/webpizza-ai-poc/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/stramanu/webpizza-ai-poc/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/stramanu/webpizza-ai-poc/releases/tag/v0.1.0
