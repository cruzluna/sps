import { ApiEndpoint } from "~/components/docs-components";

export default function UpdateApiPage() {
	return (
		<div className="font-tech">
			<ApiEndpoint
				method="PUT"
				route="/prompt/metadata"
				description="Update prompt metadata"
				parameters={[
					{
						name: "id",
						type: "string",
						required: true,
						description: "The id of the prompt",
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
				]}
				responseType="200 - Successfully updated prompt metadata | 400 - Invalid request body | 404 - Prompt not found"
			/>
		</div>
	);
}
