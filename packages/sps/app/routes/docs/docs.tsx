import { Link, Outlet } from "react-router";

type NavItem = {
  name: string;
  path?: string;
  children?: NavItem[];
};

const navigation: NavItem[] = [
  {
    name: "Getting Started",
    path: "/docs/getting-started",
  },
  {
    name: "API",
    path: "/docs/api",
    children: [
      { name: "Create", path: "/docs/api/create" },
      { name: "Read", path: "/docs/api/read" },
      { name: "Update", path: "/docs/api/update" },
      { name: "Delete", path: "/docs/api/delete" },
    ],
  },
  {
    name: "Data Model",
    path: "/docs/data-model",
  },
  {
    name: "Pricing",
    path: "/docs/pricing",
  },
  {
    name: "Upcoming Features",
    path: "/docs/upcoming-features",
  },
  {
    name: "OpenAPI Specification",
    path: "/docs/openapi-spec",
  },
  // {
  //   name: "Guides",
  //   path: "/docs/guides",
  //   children: [
  //     { name: "Guide 1", path: "/docs/guides/guide-1" },
  //     // { name: "Guide 2", path: "/docs/guides/guide-2" }, // Future guide
  //   ],
  // },
];

export default function Docs() {
  return (
    <div className="flex h-screen font-tech">
      <div className="w-[250px] border-r border-gray-200 dark:border-gray-700 p-5 h-full overflow-y-auto hidden md:block">
        <h2 className="mt-0 font-tech">^_Documentation </h2>
        <br className="text-sm text-gray-600 dark:text-gray-300" />
        <nav>
          <ul>
            {navigation.map((item) => (
              <li key={item.name} className="list-none mb-2.5">
                {item.path ? (
                  <Link
                    to={item.path}
                    className="font-tech text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
                  >
                    {item.name}
                  </Link>
                ) : (
                  <strong className="font-tech">{item.name}</strong>
                )}
                {item.children && item.children.length > 0 && (
                  <ul className="pl-5 mt-1">
                    {item.children.map((child) => (
                      <li key={child.name} className="list-none mb-1">
                        {child.path ? (
                          <Link
                            to={child.path}
                            className="font-tech text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white"
                          >
                            {child.name}
                          </Link>
                        ) : (
                          <span className="font-tech">{child.name}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="flex-1 p-5 overflow-y-auto md:ml-0">
        <Outlet />
      </div>
    </div>
  );
}
