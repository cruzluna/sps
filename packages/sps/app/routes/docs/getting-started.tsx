import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

export default function GettingStartedPage() {
  return (
    <div className="font-tech">
      <h1 className="font-tech">Getting Started</h1>
      <p className="font-tech">
        Welcome to Simple Prompt Storage! Choose your preferred method to get
        started:
      </p>

      <h2 className="font-tech mt-6 mb-4">Installation</h2>

      <h3 className="font-tech mt-4 mb-2">TypeScript/Node.js SDK</h3>
      <p className="font-tech text-sm text-gray-600 dark:text-gray-300">
        Install via Bun:{" "}
        <a
          href="https://www.npmjs.com/package/system-prompt-storage"
          className="text-blue-600 dark:text-blue-400 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          npm package
        </a>
      </p>
      <div className="max-w-4xl">
        <SyntaxHighlighter language="bash" className="font-tech">
          {`bun install system-prompt-storage`}
        </SyntaxHighlighter>
      </div>

      <h3 className="font-tech mt-4 mb-2">Python SDK</h3>
      <p className="font-tech text-sm text-gray-600 dark:text-gray-300">
        Install from PyPI:{" "}
        <a
          href="https://pypi.org/project/system-prompt-storage/"
          className="text-blue-600 dark:text-blue-400 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          PyPI package
        </a>
      </p>
      <div className="max-w-4xl">
        <SyntaxHighlighter language="bash" className="font-tech">
          {`pip install system_prompt_storage`}
        </SyntaxHighlighter>
      </div>

      <h3 className="font-tech mt-4 mb-2">cURL / REST API</h3>
      <p className="font-tech text-sm text-gray-600 dark:text-gray-300">
        Use our REST API directly with cURL or any HTTP client. See the API
        documentation for detailed endpoints.
      </p>
    </div>
  );
}
