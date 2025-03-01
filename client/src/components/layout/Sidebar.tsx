import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuthContext } from "../../context/AuthContext";
import {
  BarChart,
  FileEdit,
  FileQuestion,
  Home,
  Settings,
  MessageSquare
} from "lucide-react";
import AIChatAssistant from "./AIChatAssistant";

export default function Sidebar() {
  const [location, navigate] = useLocation();
  const { user } = useAuthContext();

  const isActive = (path: string) => {
    return location === path || location.startsWith(`${path}/`);
  };

  // Navigation items organized by sections
  const navItems = [
    {
      section: "Main",
      items: [
        {
          name: "Dashboard",
          path: "/dashboard",
          icon: <Home className="h-5 w-5 mr-3" />,
        },
        {
          name: "Create Form",
          path: "/forms/new",
          icon: <FileEdit className="h-5 w-5 mr-3" />,
        },
        {
          name: "My Forms",
          path: "/forms",
          icon: <FileQuestion className="h-5 w-5 mr-3" />,
        },
        {
          name: "Responses",
          path: "/responses",
          icon: <BarChart className="h-5 w-5 mr-3" />,
        },
        {
          name: "Settings",
          path: "/settings",
          icon: <Settings className="h-5 w-5 mr-3" />,
        }
      ],
    },
  ];

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200 h-screen">
      <div 
        className="p-4 border-b border-gray-200 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
          <h1 className="text-xl font-bold font-sans">Voice Form Agent</h1>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        {navItems.map((section) => (
          <div key={section.section} className="mb-8">
            <h3 className="text-xs uppercase font-semibold text-gray-500 mb-2">
              {section.section}
            </h3>
            <ul>
              {section.items.map((item) => (
                <li key={item.path} className="mb-1">
                  <div
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm rounded-md cursor-pointer",
                      isActive(item.path)
                        ? "text-primary bg-primary/10 font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <span className={cn(
                      isActive(item.path) ? "text-primary" : "text-gray-700"
                    )}>
                      {item.icon}
                    </span>
                    {item.name}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="mt-auto border-t border-gray-200">
        <AIChatAssistant />
      </div>
    </aside>
  );
}
