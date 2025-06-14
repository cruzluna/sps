export interface PromptMetadata {
	/** Name of the prompt */
	name?: string;
	/** Description of the prompt */
	description?: string;
	/** Category of the prompt ie React, typescript, etc. */
	category?: string;
	/** Tags of the prompt ie [react, typescript, etc.] */
	tags?: string[];
}

export interface Prompt {
	/** The id of the prompt */
	id: string;
	/** The content of the prompt */
	content: string;
	/** The version of the prompt */
	version: number;
	/** The parent of the prompt */
	parent: string;
	/** Whether the prompt is being branched */
	branched?: boolean;
	/** Whether the prompt is archived */
	archived?: boolean;
	/** The creation date of the prompt */
	created_at: number;
	/** The metadata of the prompt */
	metadata?: PromptMetadata;
}
