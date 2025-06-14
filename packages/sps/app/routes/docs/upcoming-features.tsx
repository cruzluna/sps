export default function UpcomingFeaturesPage() {
	const upcomingFeatures = [
		"Prompt Chaining",
		"Evaluations",
		"Prompt Versioning",
		"Documentation",
		"Prompt Generator",
		"LLM Model Directory",
		"Prompt Enhancers",
		"Batch Testing",
	];

	return (
		<div className="font-tech">
			<h1 className="font-tech mb-6">Upcoming Features</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{upcomingFeatures.map((feature, index) => (
					<div
						key={index}
						className="border border-gray-200 dark:border-gray-700 rounded p-4 bg-gray-50 dark:bg-gray-800"
					>
						<h3 className="font-tech font-semibold text-gray-800 dark:text-gray-200">
							{feature}
						</h3>
					</div>
				))}
			</div>
		</div>
	);
}
