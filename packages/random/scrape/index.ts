import { HTMLElement, parseHTML } from "linkedom";
import { SystemPromptStorage } from "system-prompt-storage";

console.log("Hello via Bun!");
const client = new SystemPromptStorage({
    apiKey: "empty",
    // apiKey: process.env.SYSTEM_PROMPT_STORAGE_API_KEY,
});

const sections = [
    "typescript", "next.js", "python", "react", "php",
    "javascript", "tailwindcss", "node.js", "graphql", "testing",
    "supabase", "rust", "swift", "vite", "fastapi", "browser-api"
  ];

  for (const section of sections) {
    try {
        const response = await fetch(`https://cursor.directory/rules/${section}`);
        const html = await response.text();
        console.log(html);
        const {document} = parseHTML(html);
        const rules = Array.from(document.querySelectorAll('code.text-sm.block.pr-3'))
                .map((code) => (code as HTMLElement).textContent || "");
        console.log(rules);
        for(const rule of rules) {
            const prompt = await client.prompts.create({
                content: rule,
                name: section,
                tags: [section],
            });
        }
    } catch (error) {
        console.error(`Failed to fetch rules for ${section}:`, error);
    }
  }