import { SystemPromptStorage } from "system-prompt-storage";
import type { Prompt, PromptCreateParams, PromptListParams, PromptRetrieveParams, PromptUpdateMetadataParams } from "system-prompt-storage/resources/prompts";

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

export async function getPrompt(id: string, params: PromptRetrieveParams = { metadata: true }): Promise<Prompt> {
    const prompt = await client.prompts.retrieve(id, params);
    return prompt;
}

export async function createPrompt(promptParams: PromptCreateParams): Promise<string> {
    const newPromptId = await client.prompts.create(promptParams);
    return newPromptId;
}

export async function updatePrompt(id: string, prompt: Prompt): Promise<Prompt> {
    const updateParams: PromptUpdateMetadataParams = {
        id,
        category: prompt.metadata?.category,
        description: prompt.metadata?.description,
        name: prompt.metadata?.name ,
        tags: prompt.metadata?.tags 
    };
    await client.prompts.updateMetadata(updateParams);
    return prompt;
}

export async function generateApiKey(name: string): Promise<{ id: string; key: string }> {
    // This is a placeholder - will be replaced with actual API call
    const fakeKey = `sk_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
    const id = Math.random().toString(36).substring(2, 15);
    return { id, key: fakeKey };
}
