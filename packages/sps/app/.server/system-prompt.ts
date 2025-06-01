import { SystemPromptStorage } from "system-prompt-storage";
import type { Prompt, PromptListParams, PromptListResponse } from "system-prompt-storage/resources/prompts";

const client = new SystemPromptStorage({
    apiKey:"empty"
});

export async function getPrompts(params: PromptListParams): Promise<Prompt[]> {
    console.log('Fetching prompts with params:', params);
    const prompts = await client.prompts.list(params);
    console.log(`Retrieved ${prompts.length} prompts${prompts.length > 0 ? `, first prompt: ${prompts[0].content.substring(0, 50)}...` : ''}`);
    return prompts;
}

/**
 * Undocumented endpoint to get unique categories of prompts
 * @returns Unique categories of prompts
 */
export async function getPromptCategories(): Promise<string[]> {
    const categories = await client.get('/prompt/categories');
    return categories as string[];
}

