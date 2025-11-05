import { ChatOptions, MLCEngineConfig } from "./config";
import { WorkerRequest, WorkerResponse } from "./message";
import { WebWorkerMLCEngineHandler, WebWorkerMLCEngine, ChatWorker } from "./web_worker";
/**
 * Worker handler that can be used in a ServiceWorker.
 *
 * @example
 *
 * const engine = new MLCEngine();
 * let handler;
 * chrome.runtime.onConnect.addListener(function (port) {
 *   if (handler === undefined) {
 *     handler = new ServiceWorkerMLCEngineHandler(engine, port);
 *   } else {
 *     handler.setPort(port);
 *   }
 *   port.onMessage.addListener(handler.onmessage.bind(handler));
 * });
 */
export declare class ServiceWorkerMLCEngineHandler extends WebWorkerMLCEngineHandler {
    /**
     * The modelId and chatOpts that the underlying engine (backend) is currently loaded with.
     *
     * TODO(webllm-team): This is always in-sync with `this.engine` unless device is lost due to
     * unexpected reason. Therefore, we should get it from `this.engine` directly and make handler
     * stateless. We should also perhaps make `engine` of type `MLCEngine` instead. Besides, consider
     * if we should add appConfig, or use engine's API to find the corresponding model record rather
     * than relying on just the modelId.
     */
    modelId?: string;
    chatOpts?: ChatOptions;
    private clientRegistry;
    private initRequestUuid?;
    constructor();
    postMessage(message: WorkerResponse): void;
    onmessage(event: ExtendableMessageEvent, onComplete?: (value: any) => void, onError?: () => void): void;
}
export declare class ServiceWorker implements ChatWorker {
    _onmessage: (event: MessageEvent) => void;
    get onmessage(): (event: any) => void;
    set onmessage(handler: (event: any) => void);
    postMessage(message: WorkerRequest): void;
}
/**
 * Create a ServiceWorkerMLCEngine.
 *
 * @param modelId The model to load, needs to either be in `webllm.prebuiltAppConfig`, or in
 * `engineConfig.appConfig`.
 * @param engineConfig Optionally configures the engine, see `webllm.MLCEngineConfig` for more.
 * @returns An initialized `WebLLM.ServiceWorkerMLCEngine` with `modelId` loaded.
 */
export declare function CreateServiceWorkerMLCEngine(modelId: string, engineConfig?: MLCEngineConfig, chatOpts?: ChatOptions, keepAliveMs?: number): Promise<ServiceWorkerMLCEngine>;
/**
 * A client of MLCEngine that exposes the same interface
 */
export declare class ServiceWorkerMLCEngine extends WebWorkerMLCEngine {
    missedHeatbeat: number;
    constructor(engineConfig?: MLCEngineConfig, keepAliveMs?: number);
    onmessage(event: any): void;
}
//# sourceMappingURL=service_worker.d.ts.map