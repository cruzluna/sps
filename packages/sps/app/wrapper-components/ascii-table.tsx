import {
	AsciiCard,
	AsciiCardHeader,
	AsciiCardTitle,
	AsciiCardDescription,
	AsciiCardContent,
	AsciiCardFooter,
} from "~/components/ui/ascii-card";
import type {
	Prompt,
	PromptListResponse,
} from "system-prompt-storage/resources/prompts";
import { Link } from "react-router";
import { copyToClipboard } from "~/lib/utils";

interface AsciiTableProps {
	prompts?: PromptListResponse;
}

export default function AsciiTable({ prompts }: AsciiTableProps) {
	if (!prompts || prompts.length === 0) {
		return (
			<div className="text-center p-8">
				<p className="font-tech text-gray-600 dark:text-gray-300">
					No prompts found
				</p>
			</div>
		);
	}

	return (
		<div className="w-full overflow-x-auto">
			<div
				className="grid gap-4 p-2 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 auto-rows-fr"
				style={{
					contain: "layout style",
					willChange: "auto",
				}}
			>
				{prompts.map((prompt: Prompt) => (
					<div
						key={prompt.id}
						className="min-w-[300px]"
						style={{ contain: "layout" }}
					>
						<AsciiCard className="h-full !transition-none hover:!transition-none">
							<AsciiCardHeader>
								<AsciiCardTitle className="truncate">
									{prompt.metadata?.name}
								</AsciiCardTitle>
								<AsciiCardDescription className="truncate">
									{prompt.metadata?.description}
								</AsciiCardDescription>
							</AsciiCardHeader>
							<AsciiCardContent>
								<Link to={`/prompt/${prompt.id}`}>
									<div
										className="max-h-[200px] overflow-y-auto font-mono text-sm whitespace-pre-wrap pr-2
                  scrollbar-thin scrollbar-track-gray-100 dark:scrollbar-track-gray-800
                  scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600
                  hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500"
									>
										{prompt.content}
									</div>
								</Link>
							</AsciiCardContent>
							<AsciiCardFooter className="text-xs !transition-none">
								<div className="flex justify-between items-center w-full">
									<div className="flex gap-1 font-tech">
										<button
											onClick={() => copyToClipboard(prompt.id, "id")}
											className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
											title="Copy ID"
											type="button"
										>
											cmd+c id
										</button>
										<span className="text-gray-300 dark:text-gray-600">|</span>
										<button
											onClick={() => copyToClipboard(prompt.content, "prompt")}
											className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
											title="Copy prompt content"
											type="button"
										>
											cmd+c prompt
										</button>
										<span className="text-gray-300 dark:text-gray-600">|</span>
										<Link
											to={`/prompt/${prompt.id}`}
											prefetch="intent"
											className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
											title="View Prompt"
										>
											{"[view]"}
										</Link>
									</div>
									<div className="flex gap-1">
										<span>v{prompt.version}</span>
										<span>
											{new Date(prompt.created_at * 1000).toLocaleDateString()}
										</span>
									</div>
								</div>
							</AsciiCardFooter>
						</AsciiCard>
					</div>
				))}
			</div>
		</div>
	);
}
