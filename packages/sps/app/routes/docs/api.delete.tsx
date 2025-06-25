import { ApiEndpoint } from "~/components/docs-components";
import { codeSnippets } from "./code-snippets";

export default function DeleteApiPage() {
	return (
		<div className="font-tech">
			<ApiEndpoint
				method="DELETE"
				route="/prompt/{id}"
				description="Delete prompt"
				parameters={[
					{
						name: "id",
						type: "string",
						required: true,
						description: "Prompt identifier",
					},
				]}
				responseType="200 - Successfully deleted prompt | 404 - Prompt does not exist | 500 - Internal server error"
				codeSnippets={codeSnippets.deletePrompt}
			/>
		</div>
	);
}
