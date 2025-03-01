import { useLocation, Link } from "wouter";
import {
  Home,
  FileText,
  MessageSquare,
  Settings
} from "lucide-react";

export default function MobileNav() {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div className="md:hidden border-t border-gray-200 bg-white fixed bottom-0 w-full">
      <div className="flex justify-around">
        <Link href="/">
          <a className={`flex flex-col items-center py-3 ${isActive("/") ? "text-primary" : "text-gray-500"}`}>
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Dashboard</span>
          </a>
        </Link>
        <Link href="/forms">
          <a className={`flex flex-col items-center py-3 ${isActive("/forms") ? "text-primary" : "text-gray-500"}`}>
            <FileText className="h-6 w-6" />
            <span className="text-xs mt-1">Forms</span>
          </a>
        </Link>
        <Link href="/responses">
          <a className={`flex flex-col items-center py-3 ${isActive("/responses") ? "text-primary" : "text-gray-500"}`}>
            <MessageSquare className="h-6 w-6" />
            <span className="text-xs mt-1">Responses</span>
          </a>
        </Link>
        <Link href="/settings">
          <a className={`flex flex-col items-center py-3 ${isActive("/settings") ? "text-primary" : "text-gray-500"}`}>
            <Settings className="h-6 w-6" />
            <span className="text-xs mt-1">Settings</span>
          </a>
        </Link>
      </div>
    </div>
  );
}
