/** Util methods. */
import { Tokenizer } from "@mlc-ai/web-tokenizers";
/**
 * Based on `p_prob` of size (vocabSize,) which becomes a distribution after calling
 * `applySoftmaxWithTemperature()`, sample `top_logprobs` top-probable tokens.
 *
 * @param num_top_probs: `top_logprobs` from ChatCompletionRequest
 * @param p_prob: `logitsOnCPUArray`, being a distribution after `applySoftmaxWithTemperature()`.
 *
 * Followed implementation of `ComputeTopProbsImpl()` from [https://github.com/mlc-ai/mlc-llm/blob/
 * 5b8c529e9704abd09b0432da6dcb4b013fdf43b1/cpp/serve/sampler/cpu_sampler.cc].
 *
 * @returns Arrays of (tokenID, prob) pairs, ranked from highest prob to least.
 */
export declare function getTopProbs(num_top_probs: number, p_prob: Float32Array): Array<[number, number]>;
/**
 * Get the token table in the form of a string list of tokens, ordered by their token id.
 * @param tokenizer A loaded tokenizer.
 */
export declare function getTokenTableFromTokenizer(tokenizer: Tokenizer): string[];
/**
 * Postprocess the suffix of ModelRecord.model to be "/resolve/main/" if it is not specified otherwise.
 * e.g. https://huggingface.co/mlc-ai/OpenHermes-2.5-Mistral-7B-q4f16_1-MLC/resolve/main/
 * @return the href of the final URL.
 */
export declare function cleanModelUrl(modelUrl: string): string;
/**
 * Json schema used to prompt the model for function calling; directly copied from the official guide.
 * This represents to a single function call.
 */
export declare const officialHermes2FunctionCallSchema = "{\"properties\": {\"arguments\": {\"title\": \"Arguments\", \"type\": \"object\"}, \"name\": {\"title\": \"Name\", \"type\": \"string\"}}, \"required\": [\"arguments\", \"name\"], \"title\": \"FunctionCall\", \"type\": \"object\"}";
/**
 * A list of such function calls. Used to specify response format, since the output is expected to
 * be a list of such function calls.
 */
export declare const officialHermes2FunctionCallSchemaArray: string;
/**
 * Full system prompt for Hermes-2-Pro function calling.
 */
export declare const hermes2FunctionCallingSystemPrompt: string;
//# sourceMappingURL=support.d.ts.map