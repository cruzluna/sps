import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { getSavedPromptIds, removePromptId } from "~/lib/utils";
import type { Prompt } from "system-prompt-storage/resources/prompts";

export default function DashboardPrompts() {
	const [prompts, setPrompts] = useState<Prompt[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchPrompts = async () => {
			try {
				setLoading(true);
				setError(null);

				const savedIds = getSavedPromptIds();
				console.log("SAVED IDS", savedIds);

				if (savedIds.length === 0) {
					setPrompts([]);
					return;
				}

				const idsParam = savedIds.join(",");
				const response = await fetch(
					`/api/promptbyids?ids=${encodeURIComponent(idsParam)}`,
				);
				console.log("RESPONSE", response);

				if (!response.ok) {
					throw new Error(`Failed to fetch prompts: ${response.status}`);
				}

				const fetchedPrompts = await response.json();
				setPrompts(fetchedPrompts);
			} catch (err) {
				console.error("Error fetching prompts:", err);
				setError("Failed to load prompts");
			} finally {
				setLoading(false);
			}
		};

		fetchPrompts();
	}, []);

	const handleDelete = async (promptId: string) => {
		if (
			confirm(
				"Are you sure you want to remove this prompt from your saved list?",
			)
		) {
			removePromptId(promptId);
			setPrompts((prev) => prev.filter((p) => p.id !== promptId));
		}
	};

	// Banner to show at the top
	const Banner = () => (
		<div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2 text-yellow-800 dark:text-yellow-200 text-center text-sm font-medium">
			Prompts shown are referenced from local store, :kek: ....beta. Might be
			botched
		</div>
	);

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<h1 className="text-2xl font-tech">My Prompts</h1>
					<Link to="/dashboard/create">
						<Button variant="ascii">+ Create New</Button>
					</Link>
				</div>
				<Banner />
				<div className="text-center py-8">
					<p className="text-gray-500">Loading your prompts...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<h1 className="text-2xl font-tech">My Prompts</h1>
					<Link to="/dashboard/create">
						<Button variant="ascii">+ Create New</Button>
					</Link>
				</div>
				<Banner />
				<div className="text-center py-8">
					<p className="text-red-500">{error}</p>
					<Button
						variant="ghost"
						onClick={() => window.location.reload()}
						className="mt-2"
					>
						Retry
					</Button>
				</div>
			</div>
		);
	}

	if (prompts.length === 0) {
		return (
			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<h1 className="text-2xl font-tech">My Prompts</h1>
					<Link to="/dashboard/create">
						<Button variant="ascii">+ Create New</Button>
					</Link>
				</div>
				<Banner />
				<div className="text-center py-8">
					<p className="text-gray-500">No saved prompts yet</p>
					<p className="text-sm text-gray-400 mt-2">
						Create your first prompt to get started
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-tech">My Prompts</h1>
				<Link to="/dashboard/create">
					<Button variant="ascii">+ Create New</Button>
				</Link>
			</div>
			<Banner />

			<div className="grid gap-4">
				{prompts.map((prompt) => (
					<div
						key={prompt.id}
						className="border border-gray-200 dark:border-gray-700 p-4 rounded-md hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
					>
						<div className="flex justify-between items-start">
							<div>
								<h3 className="font-tech text-lg">
									{prompt.metadata?.name || "Untitled Prompt"}
								</h3>
								<p className="text-gray-600 dark:text-gray-300 mt-1">
									{prompt.metadata?.description || "No description"}
								</p>
								<div className="flex gap-2 mt-2">
									<span className="text-sm text-gray-500 dark:text-gray-400">
										{prompt.metadata?.category || "Uncategorized"}
									</span>
									<span className="text-sm text-gray-500 dark:text-gray-400">
										•
									</span>
									<span className="text-sm text-gray-500 dark:text-gray-400">
										Created{" "}
										{new Date(prompt.created_at * 1000).toLocaleDateString()}
									</span>
								</div>
							</div>
							<div className="flex gap-2">
								<Link to={`/prompt/${prompt.id}`}>
									<Button variant="ghost" size="sm">
										Edit
									</Button>
								</Link>
								<Button
									variant="ghost"
									size="sm"
									className="text-red-500"
									onClick={() => handleDelete(prompt.id)}
								>
									Delete
								</Button>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
