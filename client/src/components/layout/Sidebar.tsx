import { useLocation, Link } from "wouter";
import {
  HomeIcon,
  ClipboardDocumentListIcon,
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
    { name: "My Forms", path: "/forms", icon: ClipboardDocumentListIcon },
    { name: "Responses", path: "/responses", icon: ChatBubbleLeftRightIcon },
    { name: "Settings", path: "/settings", icon: Cog6ToothIcon },
  ];

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-56 border-r border-gray-200 pt-5 pb-4 bg-white">
        <div className="px-6 mb-2">
          <h2 className="text-base font-medium text-gray-600">Navigation</h2>
        </div>
        <nav className="flex-1 px-3 bg-white space-y-1">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
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
