import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  Link,
} from "react-router";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "~/components/ui/navigation-menu";

import type { Route } from "./+types/root";
import "./app.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useState } from "react";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-black z-50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          to="/"
          className="text-xl font-['system-ui'] font-medium min-w-[300px] whitespace-nowrap"
        >
          +--[ simple prompt storage ]--+
        </Link>

        {/* Desktop Navigation - visible from lg screens and up */}
        <NavigationMenu className="hidden lg:block">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link
                to="/prompts"
                className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white px-4 py-2"
              >
                Prompts
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link
                to="/docs"
                className="text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white px-4 py-2"
              >
                Docs
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Menu Button - visible up to lg screens */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden flex flex-col justify-center items-center w-8 h-8 space-y-1.5"
          aria-label="Toggle mobile menu"
        >
          <div
            className={`w-6 h-0.5 bg-gray-600 dark:bg-gray-300 transition-all duration-300 ${
              isMobileMenuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <div
            className={`w-6 h-0.5 bg-gray-600 dark:bg-gray-300 transition-all duration-300 ${
              isMobileMenuOpen ? "opacity-0" : ""
            }`}
          />
          <div
            className={`w-6 h-0.5 bg-gray-600 dark:bg-gray-300 transition-all duration-300 ${
              isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile Menu Dropdown - visible up to lg screens */}
      <div
        className={`lg:hidden bg-white dark:bg-black border-t border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          isMobileMenuOpen
            ? "max-h-48 opacity-100"
            : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <div className="container mx-auto px-4 py-2 space-y-1">
          <Link
            to="/prompts"
            className="block text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white px-4 py-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Prompts
          </Link>
          <Link
            to="/docs"
            className="block text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white px-4 py-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Docs
          </Link>
        </div>
      </div>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Navigation />
        {/* Mobile UX Warning Banner */}
        <div className="md:hidden bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 px-4 py-2 fixed top-14 left-0 right-0 z-40">
          <div className="container mx-auto">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center font-mono">
              mobile experience != desktop :/
            </p>
          </div>
        </div>
        <div className="pt-14 md:pt-14">
          <div className="md:pt-0 pt-10">{children}</div>
        </div>
        <ScrollRestoration />
        <Scripts />
        <Toaster />
      </body>
    </html>
  );
}

const queryClient = new QueryClient();
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
