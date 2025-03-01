import { useLocation, Link } from "wouter";
import { Bell } from "lucide-react";
import UserMenu from "./UserMenu";
import { useAuthContext } from "@/context/AuthContext";

export default function Header() {
  const [location, setLocation] = useLocation();
  const { isAuthenticated } = useAuthContext();
  
  return (
    <header className="bg-white border-b">
      <div className="max-w-full mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
              <h1 className="ml-2 text-lg font-semibold text-gray-900 cursor-pointer">Voice Form Agent</h1>
            </div>
          </Link>
        </div>
        <div className="flex items-center">
          {isAuthenticated && (
            <button className="mr-4 p-2 rounded-full text-gray-500 hover:text-gray-700">
              <Bell className="h-6 w-6" />
            </button>
          )}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
