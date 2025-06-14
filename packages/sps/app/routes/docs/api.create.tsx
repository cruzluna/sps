import { ApiEndpoint } from "~/components/docs-components";

export default function CreateApiPage() {
	return (
		<div className="font-tech">
			<ApiEndpoint
				method="POST"
				route="/prompt"
				description="Create prompt or update it by passing the parent id"
				parameters={[
					{
						name: "content",
						type: "string",
						required: true,
						description: "The content of the prompt",
					},
					{
						name: "parent",
						type: "string | null",
						required: false,
						description:
							"The parent of the prompt. If its a new prompt with no lineage, this should be None.",
					},
					{
						name: "name",
						type: "string | null",
						required: false,
						description: "The name of the prompt",
					},
					{
						name: "description",
						type: "string | null",
						required: false,
						description: "The description of the prompt",
					},
					{
						name: "category",
						type: "string | null",
						required: false,
						description: "The category of the prompt",
					},
					{
						name: "tags",
						type: "string[] | null",
						required: false,
						description: "The tags of the prompt",
					},
					{
						name: "branched",
						type: "boolean | null",
						required: false,
						description: "Whether the prompt is being branched",
					},
				]}
				responseType="201 - Prompt object | 400 - Invalid request body"
			/>
		</div>
	);
}
