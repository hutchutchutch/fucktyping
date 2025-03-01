import { Link, useLocation } from "wouter";
import { Home, PlusSquare, List, BarChart, User } from "lucide-react";

function MobileNav() {
  const [location] = useLocation();

  const isActive = (path) => {
    return location === path || location.startsWith(`${path}/`);
  };

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <Home className="text-xl mb-1" />,
    },
    {
      name: "Create",
      path: "/forms/new",
      icon: <PlusSquare className="text-xl mb-1" />,
    },
    {
      name: "Forms",
      path: "/forms",
      icon: <List className="text-xl mb-1" />,
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: <BarChart className="text-xl mb-1" />,
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <User className="text-xl mb-1" />,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 z-10">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <a
              className={`flex flex-col items-center ${
                isActive(item.path) ? "text-primary-500" : "text-gray-500"
              }`}
            >
              {item.icon}
              <span className="text-xs">{item.name}</span>
            </a>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default MobileNav;
