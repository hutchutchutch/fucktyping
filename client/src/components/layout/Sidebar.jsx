import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuthContext } from "../../context/AuthContext";
import {
  BarChart,
  FileEdit,
  FileQuestion,
  HelpCircle,
  Home,
  Settings,
  MessageSquare
} from "lucide-react";
import AIChatAssistant from "./AIChatAssistant";

function Sidebar() {
  const [location, navigate] = useLocation();
  const { user } = useAuthContext();

  const isActive = (path) => {
    return location === path || location.startsWith(`${path}/`);
  };

  const navItems = [
    {
      section: "Main",
      items: [
        {
          name: "Dashboard",
          path: "/dashboard",
          icon: <Home className="h-4 w-4 mr-3" />,
        },
        {
          name: "Create Form",
          path: "/forms/new",
          icon: <FileEdit className="h-4 w-4 mr-3" />,
        },
        {
          name: "My Forms",
          path: "/forms",
          icon: <FileQuestion className="h-4 w-4 mr-3" />,
        },
        {
          name: "Responses",
          path: "/responses",
          icon: <BarChart className="h-4 w-4 mr-3" />,
        },
      ],
    },
    {
      section: "Account",
      items: [
        {
          name: "Settings",
          path: "/settings",
          icon: <Settings className="h-4 w-4 mr-3" />,
        },
        {
          name: "Help & Support",
          path: "/help",
          icon: <HelpCircle className="h-4 w-4 mr-3" />,
        },
      ],
    },
  ];

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200 h-screen">
      <div 
        className="p-4 border-b border-gray-200 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <h1 className="text-xl font-bold font-sans text-primary-500">Voice Form Agent</h1>
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
                        ? "text-blue-600 bg-blue-50 font-bold"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <span className={cn(
                      isActive(item.path) ? "text-blue-600" : "text-gray-700"
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

      <div className="mt-auto">
        <AIChatAssistant />
      </div>
    </aside>
  );
}

export default Sidebar;
