import { Link, Outlet } from "react-router";

export default function ApiPage() {
	return (
		<div className="font-tech">
			<h1 className="font-tech mb-4">API Reference</h1>
			<p className="font-tech text-gray-700 dark:text-gray-300 mb-6">
				Complete reference for the Simple Prompt Storage API endpoints.
			</p>

			<div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
				<Link
					to="/docs/api/create"
					className="font-tech px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
				>
					Create
				</Link>
				<Link
					to="/docs/api/read"
					className="font-tech px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
				>
					Read
				</Link>
				<Link
					to="/docs/api/update"
					className="font-tech px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
				>
					Update
				</Link>
				<Link
					to="/docs/api/delete"
					className="font-tech px-3 py-2 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
				>
					Delete
				</Link>
			</div>

			<Outlet />
		</div>
	);
}
