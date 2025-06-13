import { useState, useEffect } from "react";
import {
  getApiKeys,
  saveApiKey,
  removeApiKey,
  copyToClipboard,
} from "~/lib/utils";
import { toast } from "sonner";
import { useFetcher } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { Button } from "~/components/ui/button";

type ApiKey = {
  id: string;
  name: string;
  key: string;
  createdAt: string;
};

type LoaderData = {
  success: boolean;
};

type ActionData = {
  success: boolean;
  apiKey?: ApiKey;
};

export async function loader({ request }: LoaderFunctionArgs) {
  return Response.json({ success: true });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get("name") as string;

  // Generate a fake key (this will be replaced with actual API call later)
  const fakeKey = `sk_${Math.random()
    .toString(36)
    .substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
  const id = Math.random().toString(36).substring(2, 15);

  return Response.json({
    success: true,
    apiKey: {
      id,
      name,
      key: fakeKey,
      createdAt: new Date().toISOString(),
    },
  });
}

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const fetcher = useFetcher<ActionData>();
  const isGenerating = fetcher.state === "submitting";

  useEffect(() => {
    setApiKeys(getApiKeys());
  }, []);

  useEffect(() => {
    if (fetcher.data?.success && fetcher.data?.apiKey) {
      const newApiKey = fetcher.data.apiKey;
      saveApiKey(newApiKey);
      setApiKeys((prev) => [...prev, newApiKey]);
      setNewKeyName("");
      toast.success("API key generated successfully");
    }
  }, [fetcher.data]);

  const handleGenerateKey = () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a name for the API key");
      return;
    }

    fetcher.submit({ name: newKeyName }, { method: "post" });
  };

  const handleDeleteKey = (id: string) => {
    removeApiKey(id);
    setApiKeys(apiKeys.filter((key) => key.id !== id));
    toast.success("API key deleted");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2 text-yellow-800 dark:text-yellow-200 text-center text-sm font-medium mb-6">
        API keys are not secure in this beta version... don't worry if they leak
        :kek:
      </div>
      <div className="mb-8">
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleGenerateKey();
              }
            }}
            placeholder="Enter API key name"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md bg-transparent"
          />
          <Button
            variant={"ascii"}
            onClick={handleGenerateKey}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate Key"}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {apiKeys.map((apiKey) => (
          <div
            key={apiKey.id}
            className="border border-gray-300 rounded-md p-4"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-mono text-lg">{apiKey.name}</h3>
                <p className="text-sm text-gray-500">
                  Created: {new Date(apiKey.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Button
                variant={"ascii"}
                onClick={() => handleDeleteKey(apiKey.id)}
              >
                [X]
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono text-sm bg-gray-100 p-2 rounded">
                {apiKey.key}
              </code>
              <Button
                variant={"ascii"}
                onClick={() => copyToClipboard(apiKey.key, "id")}
              >
                Copy
              </Button>
            </div>
          </div>
        ))}

        {apiKeys.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <pre>
              {`
+------------------+
|  No API Keys     |
+------------------+
`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
