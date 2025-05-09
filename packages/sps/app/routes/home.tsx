import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "System Prompt Storage" },
    {
      name: "description",
      content:
        "Make storing prompts simple and never hardcode it in code again",
    },
  ];
}

export default function Home() {
  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-8 min-h-0">
        <header className="flex flex-col items-center gap-4">
          <h1 className="text-3xl font-medium font-['system-ui']">
            System Prompt Storage
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-center max-w-md font-['system-ui']">
            Make storing prompts simple and never hardcode it in code again
          </p>
        </header>
        <div className="mt-8 w-full max-w-2xl overflow-auto">
          <img
            src="/excalidraw-db-v0.svg"
            alt="System Prompt Storage Architecture"
            className="w-full max-h-[400px] object-contain"
          />
        </div>
        <div className="mt-12 w-full max-w-2xl overflow-auto">
          <h2 className="text-xl font-medium font-['system-ui'] mb-4 text-center">
            Development Plan
          </h2>
          <iframe
            src="https://link.excalidraw.com/readonly/gm4QcTLKdalUvtqURely?darkMode=truehttps://link.excalidraw.com/readonly/gm4QcTLKdalUvtqURely"
            width="100%"
            height="100%"
            className="rounded-lg h-96"
          />
        </div>

        <div className="mt-12 w-full max-w-2xl">
          <h2 className="text-xl font-medium font-['system-ui'] mb-4 text-center">
            Project Vision
          </h2>
          <div className="p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="font-['system-ui'] text-gray-700 dark:text-gray-200 leading-relaxed">
              System Prompt Storage is designed to be the canonical method of
              storing and retrieving prompts. Store, version, and manage prompts
              from an API rather than having to hardcode them in code.
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 font-['system-ui'] text-gray-700 dark:text-gray-200">
              <li>Update prompts without code deployments</li>
              <li>Track version history and rollback when needed</li>
              <li>Share prompt libraries across multiple applications</li>
              <li>Implement A/B testing for prompt optimization</li>
              <li>Tailored prompts for specific use cases and LLM models</li>
              <li>Agentic prompt retrieval...whatever that means lol</li>
            </ul>
            <p className="font-['system-ui'] text-gray-700 dark:text-gray-200 leading-relaxed mt-4">
              Think of prompts like a database query, now I gotta get to solving
              this...
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
