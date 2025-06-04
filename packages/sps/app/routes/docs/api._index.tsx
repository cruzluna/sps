export default function ApiIndexPage() {
  return (
    <div className="font-tech">
      <h2 className="font-tech mb-4">API Overview</h2>
      <p className="font-tech text-gray-700 dark:text-gray-300 mb-6">
        The Simple Prompt Storage API provides endpoints for managing prompts
        with full CRUD operations.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="border border-gray-200 dark:border-gray-700 rounded p-4">
          <h3 className="font-tech font-semibold mb-2 text-blue-600 dark:text-blue-400">
            Create
          </h3>
          <p className="font-tech text-sm text-gray-600 dark:text-gray-300">
            Create new prompts or update existing ones by specifying a parent
            ID.
          </p>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded p-4">
          <h3 className="font-tech font-semibold mb-2 text-green-600 dark:text-green-400">
            Read
          </h3>
          <p className="font-tech text-sm text-gray-600 dark:text-gray-300">
            Retrieve prompts, their content, and lists of prompts with
            pagination support.
          </p>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded p-4">
          <h3 className="font-tech font-semibold mb-2 text-yellow-600 dark:text-yellow-400">
            Update
          </h3>
          <p className="font-tech text-sm text-gray-600 dark:text-gray-300">
            Update prompt metadata including name, description, category, and
            tags.
          </p>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded p-4">
          <h3 className="font-tech font-semibold mb-2 text-red-600 dark:text-red-400">
            Delete
          </h3>
          <p className="font-tech text-sm text-gray-600 dark:text-gray-300">
            Delete prompts by their unique identifier.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 rounded p-4">
        <h4 className="font-tech font-semibold mb-2">Base URLs</h4>
        <div className="font-tech text-sm space-y-1">
          <div>
            <strong>Production:</strong> <code>https://api.cruzluna.dev</code>
          </div>
          <div>
            <strong>Local:</strong> <code>http://localhost:8080</code>
          </div>
        </div>
      </div>
    </div>
  );
}
