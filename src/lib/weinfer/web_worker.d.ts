import { AppConfig, ChatOptions, MLCEngineConfig, GenerationConfig } from "./config";
import { MLCEngineInterface, GenerateProgressCallback, InitProgressCallback, LogLevel, LogitProcessor } from "./types";
import { ChatCompletionRequestBase, ChatCompletionRequestStreaming, ChatCompletionRequestNonStreaming, ChatCompletion, ChatCompletionChunk } from "./openai_api_protocols/index";
import * as API from "./openai_api_protocols/apis";
import { MessageContent, WorkerRequest } from "./message";
import { MLCEngine } from "./engine";
/**
 * Worker handler that can be used in a WebWorker
 *
 * @example
 *
 * // setup a chat worker handler that routes
 * // requests to the chat
 * const engine = new MLCEngine();
 * cont handler = new WebWorkerMLCEngineHandler(engine);
 * onmessage = handler.onmessage;
 */
export declare class WebWorkerMLCEngineHandler {
    protected engine: MLCEngine;
    protected chatCompletionAsyncChunkGenerator?: AsyncGenerator<ChatCompletionChunk, void, void>;
    /**
     * @param engine A concrete implementation of MLCEngineInterface
     */
    constructor();
    postMessage(msg: any): void;
    setLogitProcessorRegistry(logitProcessorRegistry?: Map<string, LogitProcessor>): void;
    handleTask<T extends MessageContent>(uuid: string, task: () => Promise<T>): Promise<void>;
    onmessage(event: any, onComplete?: (value: any) => void, onError?: () => void): void;
}
export interface ChatWorker {
    onmessage: any;
    postMessage: (message: any) => void;
}
/**
 * Creates `WebWorkerMLCEngine`, a client that holds the same interface as `MLCEngine`.
 *
 * Equivalent to `new webllm.WebWorkerMLCEngine(worker).reload(...)`.
 *
 * @param worker The worker that holds the actual MLCEngine, intialized with `new Worker()`.
 * @param modelId The model to load, needs to either be in `webllm.prebuiltAppConfig`, or in
 * `engineConfig.appConfig`.
 * @param engineConfig Optionally configures the engine, see `webllm.MLCEngineConfig` for more.
 * @returns An initialized `WebLLM.WebWorkerMLCEngine` with `modelId` loaded.
 *
 * @note engineConfig.logitProcessorRegistry is ignored for `CreateWebWorkMLCEngine()`.
 */
export declare function CreateWebWorkerMLCEngine(worker: any, modelId: string, engineConfig?: MLCEngineConfig, chatOpts?: ChatOptions): Promise<WebWorkerMLCEngine>;
/**
 * A client of MLCEngine that exposes the same interface
 *
 * @example
 *
 * const chat = new webllm.WebWorkerMLCEngine(new Worker(
 *   new URL('./worker.ts', import.meta.url),
 *   {type: 'module'}
 * ));
 */
export declare class WebWorkerMLCEngine implements MLCEngineInterface {
    worker: ChatWorker;
    chat: API.Chat;
    /**
     * The modelId and chatOpts that the frontend expects the backend engine is currently loaded
     * with. Needed for service worker. It is the backend and handler's job to match up with the
     * expectation despite the service worker possibly being killed.
     */
    modelId?: string;
    chatOpts?: ChatOptions;
    private initProgressCallback?;
    private generateCallbackRegistry;
    private pendingPromise;
    constructor(worker: ChatWorker, engineConfig?: MLCEngineConfig);
    setInitProgressCallback(initProgressCallback?: InitProgressCallback): void;
    getInitProgressCallback(): InitProgressCallback | undefined;
    setAppConfig(appConfig: AppConfig): void;
    setLogLevel(logLevel: LogLevel): void;
    protected getPromise<T extends MessageContent>(msg: WorkerRequest): Promise<T>;
    reload(modelId: string, chatOpts?: ChatOptions): Promise<void>;
    getMaxStorageBufferBindingSize(): Promise<number>;
    getGPUVendor(): Promise<string>;
    getMessage(): Promise<string>;
    generate(input: string | ChatCompletionRequestNonStreaming, progressCallback?: GenerateProgressCallback, streamInterval?: number, genConfig?: GenerationConfig): Promise<string>;
    runtimeStatsText(): Promise<string>;
    interruptGenerate(): void;
    unload(): Promise<void>;
    resetChat(keepStats?: boolean): Promise<void>;
    forwardTokensAndSample(inputIds: Array<number>, isPrefill: boolean): Promise<number>;
    /**
     * Every time the generator is called, we post a message to the worker asking it to
     * decode one step, and we expect to receive a message of `ChatCompletionChunk` from
     * the worker which we yield. The last message is `void`, meaning the generator has nothing
     * to yield anymore.
     */
    chatCompletionAsyncChunkGenerator(): AsyncGenerator<ChatCompletionChunk, void, void>;
    chatCompletion(request: ChatCompletionRequestNonStreaming): Promise<ChatCompletion>;
    chatCompletion(request: ChatCompletionRequestStreaming): Promise<AsyncIterable<ChatCompletionChunk>>;
    chatCompletion(request: ChatCompletionRequestBase): Promise<AsyncIterable<ChatCompletionChunk> | ChatCompletion>;
    onmessage(event: any): void;
}
//# sourceMappingURL=web_worker.d.ts.map