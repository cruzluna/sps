import SyntaxHighlighter from "react-syntax-highlighter";

export default function OpenApiSpecPage() {
	return (
		<div className="font-tech">
			<h1 className="font-tech">OpenAPI Specification</h1>
			<a
				href="https://api.cruzluna.dev/swagger-ui"
				className="font-tech"
				target="_blank"
				rel="noopener noreferrer"
			>
				{`>>`} https://api.cruzluna.dev/swagger-ui
			</a>
			<div className="max-w-4xl">
				<SyntaxHighlighter language="yaml" className="font-tech">
					{`openapi: 3.1.0
info:
  title: Simple Prompt Storage API
  description: |-
    Simple prompt storage API that enables users to store and retrieve prompts, no longer requiring new deployments for
            prompt updates.
  license:
    name: ''
  version: 0.0.1
servers:
- url: https://api.cruzluna.dev
  description: Production path
- url: http://localhost:8080
  description: Local path
paths:
  /prompt:
    post:
      tags:
      - routes
      summary: Create prompt or update it by passing the parent id
      operationId: create_prompt
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreatePromptRequest'
        required: true
      responses:
        '201':
          description: Successfully created prompt
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Prompt'
        '400':
          description: Invalid request body
  /prompt/metadata:
    put:
      tags:
      - routes
      summary: Update prompt metadata
      operationId: update_prompt_metadata
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateMetadataRequest'
        required: true
      responses:
        '200':
          description: Successly updated prompt metadata
          content:
            text/plain:
              schema:
                type: string
        '400':
          description: Invalid request body
        '404':
          description: Prompt not found
  /prompt/{id}:
    get:
      tags:
      - routes
      summary: Get entire prompt with option to include metadata
      operationId: get_prompt
      parameters:
      - name: id
        in: path
        description: Prompt identifier
        required: true
        schema:
          type: string
      - name: metadata
        in: query
        description: Whether to include metadata in the response
        required: false
        schema:
          type: boolean
      responses:
        '200':
          description: Successly retrieved prompt
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Prompt'
        '404':
          description: Prompt not found
        '500':
          description: Internal server error
    delete:
      tags:
      - routes
      summary: Delete prompt
      operationId: delete_prompt
      responses:
        '200':
          description: Successly deleted prompt
        '404':
          description: Prompt does not exist
        '500':
          description: Internal server error
  /prompt/{id}/content:
    get:
      tags:
      - routes
      summary: Get prompt content
      operationId: get_prompt_content
      parameters:
      - name: id
        in: path
        description: Prompt identifier
        required: true
        schema:
          type: string
      - name: latest
        in: query
        description: Latest version of the prompt
        required: false
        schema:
          type: boolean
      responses:
        '200':
          description: Successly retrieved prompt content
          content:
            text/plain:
              schema:
                type: string
        '404':
          description: Prompt not found
        '500':
          description: Internal server error
  /prompts:
    get:
      tags:
      - routes
      summary: Get list of prompts with pagination
      operationId: get_prompts
      parameters:
      - name: category
        in: query
        description: The category of the prompts to return
        required: false
        schema:
          type: string
      - name: offset
        in: query
        description: The pagination offset to start from (0-based). Default is 0.
        required: false
        schema:
          type: integer
          format: int32
          minimum: 0
      - name: limit
        in: query
        description: The number of prompts to return. Default is 10.
        required: false
        schema:
          type: integer
          format: int32
          minimum: 0
      responses:
        '200':
          description: Successly retrieved all prompts
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Prompt'
        '400':
          description: Invalid request body
components:
  schemas:
    CreatePromptRequest:
      type: object
      required:
      - content
      properties:
        branched:
          type:
          - boolean
          - 'null'
          description: Whether the prompt is being branched
        category:
          type:
          - string
          - 'null'
          description: The category of the prompt
        content:
          type: string
          description: The content of the prompt
        description:
          type:
          - string
          - 'null'
          description: The description of the prompt
        name:
          type:
          - string
          - 'null'
          description: The name of the prompt
        parent:
          type:
          - string
          - 'null'
          description: The parent of the prompt. If its a new prompt with no lineage, this should be None.
        tags:
          type:
          - array
          - 'null'
          items:
            type: string
          description: The tags of the prompt
    Prompt:
      type: object
      required:
      - id
      - content
      - version
      - parent
      - created_at
      properties:
        archived:
          type:
          - boolean
          - 'null'
          description: Whether the prompt is archived
        branched:
          type:
          - boolean
          - 'null'
          description: Whether the prompt is being branched
        content:
          type: string
          description: The content of the prompt
        created_at:
          type: integer
          format: int64
          description: The creation date of the prompt
        id:
          type: string
          description: The id of the prompt
        metadata:
          oneOf:
          - type: 'null'
          - $ref: '#/components/schemas/PromptMetadata'
            description: The metadata of the prompt
        parent:
          type: string
          description: The parent of the prompt
        version:
          type: integer
          format: int32
          description: The version of the prompt
    PromptMetadata:
      type: object
      properties:
        category:
          type:
          - string
          - 'null'
          description: Category of the prompt ie React, typescript, etc.
        description:
          type:
          - string
          - 'null'
          description: Description of the prompt
        name:
          type:
          - string
          - 'null'
          description: Name of the prompt
        tags:
          type:
          - array
          - 'null'
          items:
            type: string
          description: Tags of the prompt ie [react, typescript, etc.]
    UpdateMetadataRequest:
      type: object
      required:
      - id
      properties:
        category:
          type:
          - string
          - 'null'
          description: The category of the prompt
        description:
          type:
          - string
          - 'null'
          description: The description of the prompt
        id:
          type: string
          description: The id of the prompt
        name:
          type:
          - string
          - 'null'
          description: The name of the prompt
        tags:
          type:
          - array
          - 'null'
          items:
            type: string
          description: The tags of the prompt`}
				</SyntaxHighlighter>
			</div>
		</div>
	);
}
