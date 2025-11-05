import * as tvmjs from "tvmjs";
import { Tokenizer } from "@mlc-ai/web-tokenizers";
import { ChatConfig, GenerationConfig } from "./config";
import { Conversation } from "./conversation";
import { LogitProcessor } from "./types";
import { ChatCompletionFinishReason, ChatCompletionTokenLogprob } from "./openai_api_protocols/index";
export declare class LLMChatPipeline {
    private useGPU4Sample;
    private samplerShaderCode;
    private submitInterval;
    private gpuSampler;
    private predTokensOnGPU;
    private isFirstDecodeStep;
    private lastTokenTensor?;
    private submitTokenCnt;
    private finishTokenCnt;
    private config;
    private tokenizer;
    private tvm;
    private device;
    private vm;
    private prefill;
    private decoding;
    private embed;
    private fapplyBitmask;
    private fpostProcessTokenTable;
    private fclearKVCaches;
    private fKVCacheAddSequence;
    private fKVCacheRemoveSequence;
    private fKVCacheBeginForward;
    private fKVCacheEndForward;
    private fKVCacheEnableSlidingWindowForSeq;
    private params;
    private kvCache;
    private logitsOnCPU?;
    private filledKVCacheLength;
    private bosTokenId;
    private contextWindowSize;
    private slidingWindowSize;
    private attentionSinkSize;
    private prefillChunkSize;
    private resetStatsPerPrefill;
    private stopStr;
    private stopTokens;
    private outputMessage;
    private outputIds;
    private stopTriggered;
    private finishReason;
    private appearedTokensFreq;
    private conversation;
    private tokenLogprobArray;
    decodingTotalTime: number;
    decodingTotalTokens: number;
    prefillTotalTime: number;
    prefillTotalTokens: number;
    private curRoundDecodingTotalTokens;
    private curRoundPrefillTotalTokens;
    private curRoundDecodingTotalTime;
    private curRoundPrefillTotalTime;
    private logitProcessor?;
    private grammarFactory;
    private grammarStateMatcher?;
    private schema?;
    private tokenTable?;
    private bitmaskSize;
    private vocabSize;
    private token_postproc_method;
    constructor(tvm: tvmjs.Instance, tokenizer: Tokenizer, config: ChatConfig, logitProcessor?: LogitProcessor);
    reconstructSampler(submitInterval: number): void;
    dispose(): void;
    /**
     * Get the current message.
     */
    getMessage(): string;
    /**
     * Reset the runtime statistics
     */
    resetRuntimeStats(): void;
    /**
     * Reset the chat history
     */
    resetChat(keepStats?: boolean): void;
    /**
     * Reset KV Cache
     */
    resetKVCache(): void;
    /**
     * @returns Whether stop is triggered.
     */
    stopped(): boolean;
    /**
     * @returns Finish reason; undefined if generation not started/stopped yet.
     */
    getFinishReason(): ChatCompletionFinishReason | undefined;
    /**
     * @returns tokenLogprobArray for this current round of autoregressive generation.
     * Updated upon each sampled token, cleared upon each prefillStep().
     */
    getTokenLogprobArray(): Array<ChatCompletionTokenLogprob>;
    /**
     * @returns the number of tokens decoded for a single request or a single choice in the request.
     */
    getCurRoundDecodingTotalTokens(): number;
    /**
     * @returns the number of tokens decoded for a single request or a single choice in the request.
     */
    getCurRoundPrefillTotalTokens(): number;
    /**
     * @returns the time spent on decode for a single request or a single choice in the request.
     */
    getCurRoundDecodingTotalTime(): number;
    /**
     * @returns the time spent on  for a single request or a single choice in the request.
     */
    getCurRoundPrefillTotalTime(): number;
    /**
     * @returns Runtime stats information.
     */
    runtimeStatsText(): string;
    /**
     * @returns Runtime stats information, starting from the last prefill performed.
     */
    curRoundRuntimeStatsText(): string;
    /**
     * @returns Prefill tokens per second, starting from the last prefill performed.
     */
    getCurRoundPrefillTokensPerSec(): number;
    /**
     * @returns Prefill tokens per second, starting from the last prefill performed.
     */
    getCurRoundDecodingTokensPerSec(): number;
    /**
     * Set the seed for the RNG `this.tvm.rng`.
     */
    setSeed(seed: number): void;
    /**
     * @returns The conversation object (not a deep copy).
     */
    getConversationObject(): Conversation;
    /**
     * Set this.conversation to a new conversation object.
     */
    setConversation(newConv: Conversation): void;
    asyncLoadWebGPUPipelines(): Promise<void>;
    /**
     * Generate the first token given input prompt
     */
    prefillStep(inp: string, inp_role_str?: string, genConfig?: GenerationConfig): Promise<void>;
    decodeStep(genConfig?: GenerationConfig): Promise<void>;
    /**
     * Manually trigger stop if it is not stopped.
     */
    triggerStop(): void;
    /**
     * Add a generated token and check for stop.
     *
     * @param nextToken The next token.
     * @param genConfig Configs that override `this.config` for this round of generation.
     */
    private processNextToken;
    private forward;
    private updateLogitsOnCPU;
    private sampleTokenFromLogits;
    private sampleTokenFromLogitsUsingGPU;
    private getInputTokens;
    forwardTokensAndSample(inputIds: Array<number>, isPrefill: boolean): Promise<number>;
    /**
     * Based on `sampledToken` and `this.logitsOnCPU`, which becomes a distribution after
     * calling `this.tvm.applySoftmaxWithTemperature()`, generate `ChatCompletionTokenLogprob` and
     * update `this.tokenLogprobArray`.
     *
     * @param sampledToken The token ID sampled.
     * @param top_logprobs Number of top tokens to include; `top_logprobs` in `ChatCompletionRequest`.
     *
     * @return The `ChatCompletionTokenLogprob` for this single autoregressive step.
     */
    private getTokenLogprob;
    evaluate(): Promise<void>;
}
//# sourceMappingURL=llm_chat.d.ts.map