import SyntaxHighlighter from "react-syntax-highlighter";
import { useState } from "react";

const INIT_SNIPPETS = {
	typescript: `import SystemPromptStorage from 'system-prompt-storage';

const client = new SystemPromptStorage({
	apiKey: process.env['SYSTEM_PROMPT_STORAGE_API_KEY'], // This is the default and can be omitted
});
`,
	python: `import os
from system_prompt_storage import SystemPromptStorage

client = SystemPromptStorage(
	api_key=os.environ.get(
		"SYSTEM_PROMPT_STORAGE_API_KEY"
	),  # This is the default and can be omitted
)
`,
};

const SDK_LINKS = {
	python: "https://github.com/cruzluna/sps-python",
	typescript: "https://github.com/cruzluna/sps-sdk",
};

function ClientInitialization() {
	const [initLang, setInitLang] = useState<'python' | 'typescript'>('python');
	const [copied, setCopied] = useState(false);
	return (
		<div className="mb-8">
			<h3 className="font-tech font-semibold mb-2 text-lg">Client Initialization</h3>
			<p className="font-tech text-gray-700 dark:text-gray-300 mb-4">
				How to initialize the Simple Prompt Storage client in your language of choice.
			</p>
			<div className="flex items-center bg-[#181c23] rounded-t-md px-2 py-1 gap-2 max-w-2xl">
				{(Object.keys(INIT_SNIPPETS) as Array<'python' | 'typescript'>).map((lang) => (
					<button
						key={lang}
						type="button"
						onClick={() => setInitLang(lang)}
						className={`font-tech px-3 py-1 rounded-t-md focus:outline-none transition-colors text-sm ${
							initLang === lang
								? "bg-[#181c23] text-white border-b-2 border-white"
								: "bg-transparent text-gray-400 hover:text-white"
						}`}
					>
						{lang === "python" ? "Python" : "TypeScript"}
					</button>
				))}
				<button
					type="button"
					onClick={async () => {
						await navigator.clipboard.writeText(INIT_SNIPPETS[initLang] || "");
						setCopied(true);
						setTimeout(() => setCopied(false), 1200);
					}}
					className="ml-auto text-xs text-gray-400 pr-3 hover:text-white focus:outline-none"
				>
					{copied ? "^copied" : "copy"}
				</button>
			</div>
			<SyntaxHighlighter language={initLang} className="font-tech rounded-b-md max-w-2xl">
				{INIT_SNIPPETS[initLang]}
			</SyntaxHighlighter>
			<div className="mt-2 text-xs text-gray-500">
				{initLang === "python" ? (
					<>
						Python SDK: <a href={SDK_LINKS.python} className="underline text-blue-500" target="_blank" rel="noopener noreferrer">github.com/cruzluna/sps-python</a>
					</>
				) : (
					<>
						TypeScript SDK: <a href={SDK_LINKS.typescript} className="underline text-blue-500" target="_blank" rel="noopener noreferrer">github.com/cruzluna/sps-sdk</a>
					</>
				)}
			</div>
		</div>
	);
}

export default function ApiIndexPage() {
	return (
		<div className="font-tech">
			<h2 className="font-tech mb-4">API Overview</h2>
			<p className="font-tech text-gray-700 dark:text-gray-300 mb-6">
				The Simple Prompt Storage API provides endpoints for managing prompts
				with full CRUD operations.
			</p>


			<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
				<div className="border border-gray-200 dark:border-gray-700 rounded p-4">
					<h3 className="font-tech font-semibold mb-2 text-blue-600 dark:text-blue-400">
						Create
					</h3>
					<p className="font-tech text-sm text-gray-600 dark:text-gray-300">
						Create new prompts or update existing ones by specifying a parent
						ID.
					</p>
				</div>

				<div className="border border-gray-200 dark:border-gray-700 rounded p-4">
					<h3 className="font-tech font-semibold mb-2 text-green-600 dark:text-green-400">
						Read
					</h3>
					<p className="font-tech text-sm text-gray-600 dark:text-gray-300">
						Retrieve prompts, their content, and lists of prompts with
						pagination support.
					</p>
				</div>

				<div className="border border-gray-200 dark:border-gray-700 rounded p-4">
					<h3 className="font-tech font-semibold mb-2 text-yellow-600 dark:text-yellow-400">
						Update
					</h3>
					<p className="font-tech text-sm text-gray-600 dark:text-gray-300">
						Update prompt metadata including name, description, category, and
						tags.
					</p>
				</div>

				<div className="border border-gray-200 dark:border-gray-700 rounded p-4">
					<h3 className="font-tech font-semibold mb-2 text-red-600 dark:text-red-400">
						Delete
					</h3>
					<p className="font-tech text-sm text-gray-600 dark:text-gray-300">
						Delete prompts by their unique identifier.
					</p>
				</div>
			</div>

			<div className="bg-gray-50 dark:bg-gray-800 rounded p-4">
				<h4 className="font-tech font-semibold mb-2">Base URLs</h4>
				<div className="font-tech text-sm space-y-1">
					<div>
						<strong>Production:</strong> <code>https://api.cruzluna.dev</code>
					</div>
					<div>
						<strong>Local:</strong> <code>http://localhost:8080</code>
					</div>
				</div>
			</div>

			<div className="mb-8 mt-8">
				<ClientInitialization />
			</div>
		</div>
	);
}
