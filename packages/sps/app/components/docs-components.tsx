import SyntaxHighlighter from "react-syntax-highlighter";

type Parameter = {
	name: string;
	type: string;
	required?: boolean;
	description: string;
};

type ApiEndpointProps = {
	method: string;
	route: string;
	description: string;
	parameters?: Parameter[];
	responseType: string;
	codeSnippet?: string;
};

export function ApiEndpoint({
	method,
	route,
	description,
	parameters = [],
	responseType,
	codeSnippet,
}: ApiEndpointProps) {
	const getMethodColor = (method: string) => {
		switch (method.toUpperCase()) {
			case "GET":
				return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
			case "POST":
				return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
			case "PUT":
				return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
			case "DELETE":
				return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
			default:
				return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
		}
	};

	return (
		<div className="font-tech mb-8">
			<div className="mb-4">
				<span
					className={`inline-block px-2 py-1 text-sm font-tech rounded mr-3 ${getMethodColor(
						method,
					)}`}
				>
					{method.toUpperCase()}
				</span>
				<code className="font-tech text-lg">{route}</code>
			</div>

			<p className="font-tech text-gray-700 dark:text-gray-300 mb-4">
				{description}
			</p>

			{codeSnippet ? (
				<div className="mb-6 max-w-4xl">
					<SyntaxHighlighter language="bash" className="font-tech">
						{codeSnippet}
					</SyntaxHighlighter>
				</div>
			) : (
				<div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded max-w-4xl">
					<p className="font-tech text-gray-600 dark:text-gray-400">
						&lt;TODO CODE SNIPPET&gt;
					</p>
				</div>
			)}

			{parameters.length > 0 && (
				<div className="mb-4">
					<h4 className="font-tech font-semibold mb-2">Parameters</h4>
					<div className="space-y-2">
						{parameters.map((param) => (
							<div
								key={param.name}
								className="border-l-4 border-gray-200 dark:border-gray-600 pl-4"
							>
								<div className="flex items-center gap-2">
									<code className="font-tech text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
										{param.name}
									</code>
									<span className="font-tech text-sm text-gray-600 dark:text-gray-400">
										{param.type}
									</span>
									{param.required && (
										<span className="font-tech text-xs text-red-600 dark:text-red-400">
											required
										</span>
									)}
								</div>
								<p className="font-tech text-sm text-gray-700 dark:text-gray-300 mt-1">
									{param.description}
								</p>
							</div>
						))}
					</div>
				</div>
			)}

			<div className="mb-4">
				<h4 className="font-tech font-semibold mb-2">Response</h4>
				<code className="font-tech text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
					{responseType}
				</code>
			</div>
		</div>
	);
}
