import { Button } from "~/components/ui/button";
import {
	Link,
	Form,
	useNavigation,
	useActionData,
	useNavigate,
} from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createPrompt } from "~/.server/system-prompt";
import type { PromptCreateParams } from "system-prompt-storage/resources/prompts";
import { useState, useEffect } from "react";
import { savePromptId } from "~/lib/utils";
import { toast } from "sonner";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";

const CATEGORIES = [
	"typescript",
	"next.js",
	"python",
	"sql",
	"go",
	"ai",
	"rust",
	"java",
	"kotlin",
	"c#",
	"c++",
	"c",
	"php",
	"other",
] as const;

const promptSchema = z.object({
	content: z.string().min(1, "Prompt content is required"),
	title: z.string().min(1, "Title is required"),
	description: z.string().min(1, "Description is required"),
	category: z.enum(CATEGORIES, {
		required_error: "Category is required",
	}),
	tags: z
		.array(
			z
				.string()
				.regex(
					/^[a-zA-Z0-9\s-]+$/,
					"Tags can only contain letters, numbers, spaces, and hyphens",
				),
		)
		.max(3, "Maximum of 3 tags allowed"),
});

type FormData = z.infer<typeof promptSchema>;

export async function action({ request }: { request: Request }) {
	const formData = await request.formData();
	const rawData = Object.fromEntries(formData);
	const data: Record<string, any> = { ...rawData };

	// Convert tags to array of strings
	data.tags = formData.getAll("tags").map((tag) => tag.toString());

	console.log("Form data:", data);

	try {
		const validatedData = promptSchema.parse(data);
		console.log("Validation successful:", validatedData);
		const promptParams: PromptCreateParams = {
			content: validatedData.content,
			name: validatedData.title,
			description: validatedData.description,
			category: validatedData.category,
			branched: false,
			parent: null,
			tags: validatedData.tags.length > 0 ? validatedData.tags : null,
		};

		const createdPrompt = await createPrompt(promptParams);

		// Return the created prompt ID for client-side handling
		const result = { success: true, promptId: createdPrompt };
		console.log("createdPrompt", createdPrompt);
		return result;
	} catch (error) {
		console.error("Form submission error:", error);
		if (error instanceof z.ZodError) {
			const errors = error.flatten().fieldErrors;
			console.log("Validation errors:", errors);
			return { errors };
		}
		throw error;
	}
}

export default function CreatePrompt() {
	const navigation = useNavigation();
	const actionData = useActionData<typeof action>();
	const navigate = useNavigate();
	const isSubmitting = navigation.state === "submitting";
	const [newTag, setNewTag] = useState("");
	const [tags, setTags] = useState<string[]>([]);
	const [tagError, setTagError] = useState<string | null>(null);

	// Handle successful prompt creation
	useEffect(() => {
		console.log("actionData", actionData);
		if (
			actionData &&
			"success" in actionData &&
			actionData.success &&
			"promptId" in actionData &&
			actionData.promptId
		) {
			console.log("Saving prompt ID to localStorage:", actionData.promptId);
			try {
				savePromptId(actionData.promptId);
				console.log(
					"Successfully saved to localStorage, navigating to prompts",
				);
				navigate("/dashboard/prompts");
			} catch (error) {
				console.error("Failed to save prompt ID to localStorage:", error);
				toast.error("Failed to save prompt ID to localStorage");
			}
		}
	}, [actionData, navigate]);

	const {
		register,
		setValue,
		formState: { errors },
	} = useForm<FormData>({
		resolver: zodResolver(promptSchema),
		defaultValues: {
			tags: [],
		},
	});

	const handleAddTag = (e: React.FormEvent) => {
		e.preventDefault();
		setTagError(null);

		if (tags.length >= 3) {
			setTagError("Maximum of 3 tags allowed");
			return;
		}

		if (newTag.trim()) {
			const newTags = [...tags, newTag.trim()];
			setTags(newTags);
			setValue("tags", newTags);
			setNewTag("");
		}
	};

	const handleRemoveTag = (index: number) => {
		const newTags = tags.filter((_, i) => i !== index);
		setTags(newTags);
		setValue("tags", newTags);
	};

	return (
		<div className="max-w-2xl mx-auto space-y-6">
			<div className="flex items-center gap-4">
				<Link to="/dashboard/prompts">
					<Button variant="ghost" size="sm">
						← Back
					</Button>
				</Link>
				<h1 className="text-2xl font-tech">Create New Prompt</h1>
			</div>

			<Form method="post" className="space-y-4">
				{tags.map((tag, index) => (
					<input key={index} type="hidden" name="tags" value={tag} />
				))}
				<div className="space-y-2">
					<label
						htmlFor="title"
						className="block font-tech text-sm text-gray-700 dark:text-gray-300"
					>
						Title
					</label>
					<input
						{...register("title")}
						type="text"
						id="title"
						className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-black font-tech"
						placeholder="Enter prompt title"
					/>
					{errors.title && (
						<p className="text-red-500 text-sm">{errors.title.message}</p>
					)}
				</div>

				<div className="space-y-2">
					<label
						htmlFor="description"
						className="block font-tech text-sm text-gray-700 dark:text-gray-300"
					>
						Description
					</label>
					<textarea
						{...register("description")}
						id="description"
						rows={3}
						className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-black font-tech"
						placeholder="Enter prompt description"
					/>
					{errors.description && (
						<p className="text-red-500 text-sm">{errors.description.message}</p>
					)}
				</div>

				<div className="space-y-2">
					<label
						htmlFor="category"
						className="block font-tech text-sm text-gray-700 dark:text-gray-300"
					>
						Category
					</label>
					<Select
						{...register("category")}
						id="category"
						className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-black font-tech"
					>
						<SelectTrigger>
							<SelectValue placeholder="Select a category" />
						</SelectTrigger>
						<SelectContent>
							{CATEGORIES.map((category) => (
								<SelectItem key={category} value={category}>
									{category}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{errors.category && (
						<p className="text-red-500 text-sm">{errors.category.message}</p>
					)}
				</div>

				<div className="space-y-2">
					<label className="block font-tech text-sm text-gray-700 dark:text-gray-300">
						Tags
					</label>
					<div className="flex gap-2">
						<input
							type="text"
							value={newTag}
							onChange={(e) => setNewTag(e.target.value)}
							className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-black font-tech"
							placeholder="Enter a tag (letters, numbers, spaces, hyphens only)"
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									handleAddTag(e);
								}
							}}
						/>
						<Button
							type="button"
							variant="outline"
							onClick={handleAddTag}
							className="font-tech"
							disabled={tags.length >= 3}
						>
							Add Tag
						</Button>
					</div>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Maximum 3 tags allowed. Only letters, numbers, spaces, and hyphens
						are allowed.
					</p>
					{tagError && <p className="text-red-500 text-sm">{tagError}</p>}
					<div className="flex flex-wrap gap-2 mt-2">
						{tags.map((tag, index) => (
							<div
								key={index}
								className="flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full"
							>
								<span className="text-sm font-tech">{tag}</span>
								<button
									type="button"
									onClick={() => handleRemoveTag(index)}
									className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
								>
									×
								</button>
							</div>
						))}
					</div>
					{errors.tags && (
						<p className="text-red-500 text-sm">{errors.tags.message}</p>
					)}
				</div>

				<div className="space-y-2">
					<label
						htmlFor="content"
						className="block font-tech text-sm text-gray-700 dark:text-gray-300"
					>
						Prompt Content
					</label>
					<textarea
						{...register("content")}
						id="content"
						rows={6}
						className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-black font-tech"
						placeholder="Enter your prompt content"
					/>
					{errors.content && (
						<p className="text-red-500 text-sm">{errors.content.message}</p>
					)}
				</div>

				<div className="flex justify-end gap-4">
					<Link to="/dashboard/prompts">
						<Button variant="ghost">Cancel</Button>
					</Link>
					<Button variant="ascii" type="submit" disabled={isSubmitting}>
						{isSubmitting ? "Creating..." : "Create Prompt"}
					</Button>
				</div>
			</Form>
		</div>
	);
}
