import { ApiEndpoint } from "~/components/docs-components";
import { codeSnippets } from "./code-snippets";

export default function ReadApiPage() {
	return (
		<div className="font-tech">
			<ApiEndpoint
				method="GET"
				route="/prompt/{id}"
				description="Get entire prompt with option to include metadata"
				parameters={[
					{
						name: "id",
						type: "string",
						required: true,
						description: "Prompt identifier",
					},
					{
						name: "metadata",
						type: "boolean",
						required: false,
						description: "Whether to include metadata in the response",
					},
				]}
				responseType="200 - Prompt object | 404 - Prompt not found | 500 - Internal server error"
				codeSnippets={codeSnippets.getPrompt}
			/>

			<ApiEndpoint
				method="GET"
				route="/prompt/{id}/content"
				description="Get prompt content"
				parameters={[
					{
						name: "id",
						type: "string",
						required: true,
						description: "Prompt identifier",
					},
					{
						name: "latest",
						type: "boolean",
						required: false,
						description: "Latest version of the prompt",
					},
				]}
				responseType="200 - Prompt content (text/plain) | 404 - Prompt not found | 500 - Internal server error"
				codeSnippets={codeSnippets.getPromptContent}
			/>

			<ApiEndpoint
				method="GET"
				route="/prompts"
				description="Get list of prompts with pagination"
				parameters={[
					{
						name: "category",
						type: "string",
						required: false,
						description: "The category of the prompts to return",
					},
					{
						name: "offset",
						type: "integer",
						required: false,
						description:
							"The pagination offset to start from (0-based). Default is 0.",
					},
					{
						name: "limit",
						type: "integer",
						required: false,
						description: "The number of prompts to return. Default is 10.",
					},
				]}
				responseType="200 - Array of Prompt objects | 400 - Invalid request body"
				codeSnippets={codeSnippets.listPrompts}
			/>
		</div>
	);
}
