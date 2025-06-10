import { Button } from "~/components/ui/button";
import { Link } from "react-router";

// Sample data - this will be replaced with API calls later
const samplePrompts = [
  {
    id: "1",
    title: "Code Review Assistant",
    description: "A prompt to help review code and suggest improvements",
    category: "Development",
    createdAt: "2024-03-20",
  },
  {
    id: "2",
    title: "Content Writer",
    description: "A prompt to help write engaging blog posts",
    category: "Writing",
    createdAt: "2024-03-19",
  },
  {
    id: "3",
    title: "Data Analysis Helper",
    description: "A prompt to assist with data analysis tasks",
    category: "Data",
    createdAt: "2024-03-18",
  },
];

export default function DashboardPrompts() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-tech">My Prompts</h1>
        <Link to="/dashboard/create">
          <Button variant="ascii">+ Create New</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {samplePrompts.map((prompt) => (
          <div
            key={prompt.id}
            className="border border-gray-200 dark:border-gray-700 p-4 rounded-md hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-tech text-lg">{prompt.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {prompt.description}
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {prompt.category}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    •
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Created {prompt.createdAt}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
                <Button variant="ghost" size="sm" className="text-red-500">
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
