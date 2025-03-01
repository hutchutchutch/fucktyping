import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuthContext } from "../../context/AuthContext";
import {
  BarChart,
  FileEdit,
  FileQuestion,
  HelpCircle,
  Home,
  LogOut,
  Settings,
} from "lucide-react";

function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuthContext();

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
          name: "Analytics",
          path: "/analytics",
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
      <div className="p-4 border-b border-gray-200">
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
                  <Link href={item.path}>
                    <a
                      className={cn(
                        "flex items-center px-3 py-2 text-sm rounded-md",
                        isActive(item.path)
                          ? "text-primary-500 bg-primary-50"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      {item.icon}
                      {item.name}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
            {user?.firstName?.[0] || "U"}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">
              {user?.firstName
                ? `${user.firstName} ${user.lastName || ""}`
                : "Guest User"}
            </p>
            <p className="text-xs text-gray-500">{user?.email || "guest@example.com"}</p>
          </div>
          <button
            onClick={logout}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
