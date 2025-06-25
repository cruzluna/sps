export const codeSnippets = {
  deletePrompt: {
    typescript: `// Delete a prompt\nawait client.prompts.delete("prompt_id");`,
    python: `# Delete a prompt\nclient.prompts.delete("prompt_id")`,
  },
  getPrompt: {
    typescript: `// Get prompt with metadata\nconst prompt = await client.prompts.retrieve("prompt_id", { metadata: true });\n\n// Get prompt without metadata\nconst prompt = await client.prompts.retrieve("prompt_id");`,
    python: `# Get prompt with metadata\nprompt = client.prompts.retrieve("prompt_id", metadata=True)\n\n# Get prompt without metadata\nprompt = client.prompts.retrieve("prompt_id")`,
  },
  getPromptContent: {
    typescript: `// Get prompt content (latest version)\nconst content = await client.prompts.retrieveContent("prompt_id", { latest: true });\n\n// Get prompt content (specific version)\nconst content = await client.prompts.retrieveContent("prompt_id");`,
    python: `# Get prompt content (latest version)\ncontent = client.prompts.retrieve_content("prompt_id", latest=True)\n\n# Get prompt content (specific version)\ncontent = client.prompts.retrieve_content("prompt_id")`,
  },
  listPrompts: {
    typescript: `// Get all prompts\nconst prompts = await client.prompts.list();\n\n// Get prompts with pagination\nconst prompts = await client.prompts.list({ limit: 20, offset: 0 });\n\n// Get prompts by category\nconst prompts = await client.prompts.list({ category: "React" });`,
    python: `# Get all prompts\nprompts = client.prompts.list()\n\n# Get prompts with pagination\nprompts = client.prompts.list(limit=20, offset=0)\n\n# Get prompts by category\nprompts = client.prompts.list(category="React")`,
  },
  createPrompt: {
    typescript: `// Create a new prompt\nconst promptId = await client.prompts.create({\n\tcontent: "Your prompt content here",\n\tname: "My Prompt",\n\tdescription: "A description of the prompt",\n\tcategory: "React",\n\ttags: ["react", "typescript"]\n});\n\n// Create a prompt with parent (branching)\n// Likely won't need this for now\nconst promptId = await client.prompts.create({\n\tcontent: "Updated prompt content",\n\tparent: "parent_prompt_id",\n\tbranched: true\n});`,
    python: `# Create a new prompt\nprompt_id = client.prompts.create(\n    content="Your prompt content here",\n    name="My Prompt",\n    description="A description of the prompt",\n    category="React",\n    tags=["react", "typescript"]\n)\n\n# Create a prompt with parent (branching)\n# Likely won't need this for now\nprompt_id = client.prompts.create(\n    content="Updated prompt content",\n    parent="parent_prompt_id",\n    branched=True\n)`,
  },
  updatePrompt: {
    typescript: `// Update prompt metadata\nconst result = await client.prompts.updateMetadata({\n  id: "prompt_id",\n  name: "Updated Prompt Name",\n  description: "Updated description",\n  category: "TypeScript",\n  tags: ["typescript", "javascript"]\n});`,
    python: `# Update prompt metadata\nresult = client.prompts.update_metadata(\n    id="prompt_id",\n    name="Updated Prompt Name",\n    description="Updated description",\n    category="TypeScript",\n    tags=["typescript", "javascript"]\n)`,
  },
}; 