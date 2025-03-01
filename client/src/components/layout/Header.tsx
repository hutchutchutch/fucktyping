import { useLocation, Link } from "wouter";
import { Bell } from "lucide-react";

export default function Header() {
  const [location, setLocation] = useLocation();
  
  const userInfo = {
    name: "Sarah Wilson",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
          <Link href="/">
            <h1 className="ml-2 text-xl font-semibold text-gray-900 cursor-pointer">Voice Form Agent</h1>
          </Link>
        </div>
        <div className="flex items-center">
          <button className="mr-4 p-2 rounded-full text-gray-500 hover:text-gray-700">
            <Bell className="h-6 w-6" />
          </button>
          <div className="flex items-center bg-gray-100 rounded-full px-3 py-1">
            <img className="h-8 w-8 rounded-full" src={userInfo.avatarUrl} alt="User avatar" />
            <span className="ml-2 text-sm font-medium text-gray-700">{userInfo.name}</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}
