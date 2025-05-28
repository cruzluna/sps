import { SystemPromptStorage } from "system-prompt-storage";
import type { Prompt, PromptListParams, PromptListResponse } from "system-prompt-storage/resources/prompts";

const client = new SystemPromptStorage({
    apiKey:"empty"
});

export async function getPrompts(params: PromptListParams): Promise<Prompt[]> {
    const prompts = await client.prompts.list(params);
    return prompts;
}

