import { useLocation, Link } from "wouter";
import {
  HomeIcon,
  DocumentDuplicateIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";

export default function Sidebar() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  const navItems = [
    { name: "Dashboard", path: "/", icon: HomeIcon },
    { name: "My Forms", path: "/forms", icon: DocumentDuplicateIcon },
    { name: "Responses", path: "/responses", icon: ChatBubbleLeftRightIcon },
    { name: "Settings", path: "/settings", icon: Cog6ToothIcon },
  ];

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-48 border-r border-gray-200 bg-white">
        <div className="px-4 py-4">
          <h2 className="text-sm font-medium text-gray-600">Navigation</h2>
        </div>
        <nav className="flex-1 bg-white space-y-1 pb-4">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a
                className={`group flex items-center px-4 py-2 text-sm font-medium ${
                  isActive(item.path)
                    ? "text-white bg-primary"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    isActive(item.path)
                      ? "text-white"
                      : "text-gray-500 group-hover:text-gray-500"
                  }`}
                />
                {item.name}
              </a>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
