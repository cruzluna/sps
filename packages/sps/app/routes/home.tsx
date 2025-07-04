import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "Simple Prompt Storage" },
		{
			name: "description",
			content:
				"Make storing prompts simple and never hardcode it in code again",
		},
	];
}

export default function Home() {
	return (
		<main className="flex items-center justify-center pt-16 pb-4">
			<div className="flex-1 flex flex-col items-center gap-8 min-h-0">
				<header className="flex flex-col items-center gap-4">
					<h1 className="text-3xl font-medium font-tech whitespace-pre">
						simple prompt storage
					</h1>
					<p className="text-gray-600 dark:text-gray-300 text-center max-w-md font-tech">
						Make storing prompts simple and never hardcode it in code again
					</p>
				</header>
				<div className="mt-12 w-full max-w-2xl">
					<h2 className="text-xl font-medium font-tech mb-4 text-center">
						Project Vision
					</h2>
					<div className="p-6 rounded-lg border border-gray-200 dark:border-gray-700">
						<p className="font-tech text-gray-700 dark:text-gray-200 leading-relaxed">
							Simple Prompt Storage is designed to be the canonical method of
							storing and retrieving prompts. Store, version, and manage prompts
							from an API rather than having to hardcode them in code.
						</p>
						<ul className="list-disc pl-6 mt-4 space-y-2 font-tech text-gray-700 dark:text-gray-200">
							<li>Update prompts without code deployments</li>
							<li>Track version history and rollback when needed</li>
							<li>Share prompt libraries across multiple applications</li>
							<li>Implement A/B testing for prompt optimization</li>
							<li>Tailored prompts for specific use cases and LLM models</li>
							<li>Agentic prompt retrieval...whatever that means lol</li>
						</ul>
						<p className="font-tech text-gray-700 dark:text-gray-200 leading-relaxed mt-4">
							Think of prompts like a database query, now I gotta get to solving
							this...
						</p>
					</div>
				</div>

				<footer className="mt-16 mb-8 flex items-center justify-center font-tech">
					<div className="flex items-center gap-4">
						<a
							href="https://www.cruzluna.dev"
							target="_blank"
							rel="noopener noreferrer"
							className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
						>
							cruzluna.dev
						</a>
						<a
							href="https://x.com/nvimcruz"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center"
						>
							<img
								src="/x.svg"
								alt="X (Twitter)"
								className="w-5 h-5 dark:invert"
							/>
						</a>
					</div>
				</footer>
			</div>
		</main>
	);
}
