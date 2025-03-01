import { useLocation, Link } from "wouter";
import {
  HomeIcon,
  DocumentDuplicateIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import AIChatAssistant from "@/components/layout/AIChatAssistant";

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
    <aside className="hidden md:block md:w-64 md:fixed md:inset-y-0 md:z-50">
      <div className="flex flex-col h-full border-r border-gray-200 bg-white shadow-sm">
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
            <span className="ml-2 text-lg font-semibold text-gray-900">Voice Form Agent</span>
          </div>
        </div>
        
        {/* Navigation section */}
        <div className="px-4 py-3">
          <h2 className="text-xs font-medium uppercase tracking-wider text-gray-500">Navigation</h2>
        </div>
        <nav className="flex-1 space-y-1 px-2">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <div
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer ${
                  isActive(item.path)
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <item.icon
                  className={`mr-3 h-5 w-5 flex-shrink-0 ${
                    isActive(item.path)
                      ? "text-white"
                      : "text-gray-500 group-hover:text-gray-500"
                  }`}
                />
                {item.name}
              </div>
            </Link>
          ))}
        </nav>
        
        {/* AI Chat Assistant at the bottom of sidebar */}
        <div className="mt-auto border-t border-gray-200">
          <AIChatAssistant />
        </div>
      </div>
    </aside>
  );
}
