import React from "react";
import { useLocation } from "wouter";
import { Home, PlusSquare, List, BarChart, User, Settings } from "lucide-react";

export default function MobileNav() {
  const [location, navigate] = useLocation();

  const isActive = (path: string) => {
    return location === path || location.startsWith(`${path}/`);
  };

  // Navigation items configuration
  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Forms",
      path: "/forms",
      icon: <List className="h-5 w-5" />,
    },
    {
      name: "Create",
      path: "/forms/new",
      icon: <PlusSquare className="h-5 w-5" />,
      special: true
    },
    {
      name: "Responses",
      path: "/responses",
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings className="h-5 w-5" />,
    }
  ];

  return (
    <nav className="md:hidden border-t border-gray-200 bg-white fixed bottom-0 w-full z-50">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <div 
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center py-3 px-2 cursor-pointer ${
              item.special 
                ? "" 
                : isActive(item.path) 
                  ? "text-primary" 
                  : "text-gray-500"
            }`}
          >
            {item.special ? (
              <div className="bg-primary rounded-full p-2 -mt-8 shadow-lg border-4 border-white">
                {React.cloneElement(item.icon, { className: "text-white" })}
              </div>
            ) : (
              item.icon
            )}
            <span className={`text-xs mt-1 ${item.special ? "text-primary" : ""}`}>
              {item.name}
            </span>
          </div>
        ))}
      </div>
    </nav>
  );
}
