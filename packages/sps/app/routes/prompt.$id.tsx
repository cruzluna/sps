import { useLoaderData, Link } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getPrompt } from "~/.server/system-prompt";
import { copyToClipboard } from "~/lib/utils";

export async function loader({ params }: LoaderFunctionArgs) {
	const { id } = params;
	if (!id) {
		throw new Response("Prompt ID is required", { status: 400 });
	}

	try {
		const prompt = await getPrompt(id);
		return { prompt };
	} catch (error) {
		console.error("Failed to load getPrompt: ", error);
		throw new Response("Prompt not found", { status: 404 });
	}
}

function formatDate(timestamp: number): string {
	return new Date(timestamp * 1000).toISOString().split("T")[0];
}

function SectionHeader({ title }: { title: string }) {
	return (
		<div className="mb-3">
			<div className="flex items-center">
				<span className="text-sm">+--[ {title} ]</span>
				<div className="flex-1 border-t border-black ml-1"></div>
				<span className="text-sm">+</span>
			</div>
		</div>
	);
}

export default function PromptPage() {
	const { prompt } = useLoaderData<typeof loader>();

	const isParentSelf = prompt.parent === prompt.id;

	return (
		<div className="min-h-screen bg-white text-black font-tech p-6">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="mb-6">
					<SectionHeader title="PROMPT DETAILS" />
					<div className="pl-4">
						<h1 className="text-2xl font-bold mb-2">
							{prompt.metadata?.name || "Prompt missing name"}
						</h1>
						{prompt.metadata?.description && (
							<p className="text-black/70 mb-2">
								{prompt.metadata.description}
							</p>
						)}
					</div>
				</div>

				{/* Metadata Section */}
				<div className="mb-6">
					<SectionHeader title="METADATA" />
					<div className="pl-4 grid grid-cols-2 gap-4 text-sm">
						<div>
							<span className="text-black/70">ID:</span> {prompt.id}
						</div>
						<div>
							<span className="text-black/70">Version:</span> {prompt.version}
						</div>
						<div>
							<span className="text-black/70">Created:</span>{" "}
							{formatDate(prompt.created_at)}
						</div>
						<div>
							<span className="text-black/70">Parent:</span>{" "}
							{isParentSelf ? (
								<span
									className="text-black/50 cursor-default border-b border-dashed border-black/30"
									title="parent == this.prompt"
								>
									{"parent == this.prompt"}
								</span>
							) : (
								<Link
									to={`/prompt/${prompt.parent}`}
									className="text-black hover:text-black/70 underline underline-offset-2"
									prefetch="intent"
								>
									{prompt.parent}
								</Link>
							)}
						</div>
						{prompt.metadata?.category && (
							<div>
								<span className="text-black/70">Category:</span>{" "}
								{prompt.metadata.category}
							</div>
						)}
						<div>
							<span className="text-black/70">Status:</span>{" "}
							{prompt.archived ? "ARCHIVED" : "ACTIVE"}
							{prompt.branched && " | BRANCHED"}
						</div>
					</div>

					{prompt.metadata?.tags && prompt.metadata.tags.length > 0 && (
						<div className="pl-4 mt-3">
							<span className="text-black/70 text-sm">Tags:</span>
							<div className="mt-1">
								<pre className="text-xs">
									{`[ ${prompt.metadata.tags.join(" | ")} ]`}
								</pre>
							</div>
						</div>
					)}
				</div>

				{/* Content Section */}
				<div className="mb-6">
					<SectionHeader title="CONTENT" />
					<div className="flex justify-end mb-2">
						<button
							className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors text-xs font-tech"
							title="more features soon"
						>
							{"[more features soon]"}
						</button>

						<span className="text-gray-300 dark:text-gray-600">|</span>
						<button
							onClick={() => copyToClipboard(prompt.content, "prompt")}
							className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors text-xs font-tech"
							title="Copy prompt content"
						>
							cmd+c prompt
						</button>
					</div>
					<div className="border border-black/20 bg-gray-50 p-4">
						<pre className="whitespace-pre-wrap text-sm leading-relaxed">
							{prompt.content}
						</pre>
					</div>
				</div>
			</div>
		</div>
	);
}
