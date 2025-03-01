import { useLocation, Link } from "wouter";
import {
  Home,
  FileText,
  MessageSquare,
  Settings,
  Zap
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  const navItems = [
    { name: "Dashboard", path: "/", icon: Home },
    { name: "My Forms", path: "/forms", icon: FileText },
    { name: "Responses", path: "/responses", icon: MessageSquare },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-gray-200 pt-5 pb-4 bg-white">
        <div className="px-4">
          <h2 className="text-lg font-medium text-gray-900">Navigation</h2>
        </div>
        <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <a
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                  isActive(item.path)
                    ? "text-white bg-primary"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <item.icon
                  className={`mr-3 h-6 w-6 ${
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
        <div className="px-4 mt-6">
          <div className="rounded-lg bg-indigo-50 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-primary">Pro Tip</h3>
                <div className="mt-1 text-xs text-indigo-700">
                  <p>Use voice commands to quickly create new forms.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
