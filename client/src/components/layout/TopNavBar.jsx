import { useState } from "react";
import { Link } from "wouter";
import { useAuthContext } from "../../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { 
  Bell, 
  LogOut, 
  Menu, 
  Search, 
  Settings, 
  User,
  HelpCircle
} from "lucide-react";
import SimpleTour from "@/components/onboarding/SimpleTour";

function TopNavBar({ onToggleSidebar }) {
  const { user, logout } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [showTour, setShowTour] = useState(false);
  
  const completeTour = () => {
    setShowTour(false);
    localStorage.setItem('hasSeenTour', 'true');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/dashboard">
            <a className="ml-3 text-xl font-bold font-sans text-primary-500">
              Voice Form Agent
            </a>
          </Link>
        </div>

        <div className="hidden md:block">
          <form onSubmit={handleSearch} className="relative w-64">
            <Input
              type="text"
              placeholder="Search forms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 text-sm"
            />
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
              <Search className="h-4 w-4" />
            </span>
          </form>
        </div>

        <div className="flex items-center space-x-4">
          {/* Tour Button */}
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900 hidden md:flex items-center"
            onClick={() => setShowTour(true)}
          >
            <HelpCircle className="h-4 w-4 mr-1" />
            <span className="text-xs">Take Tour</span>
          </Button>
          
          {/* Tour Component */}
          {showTour && (
            <SimpleTour 
              onComplete={completeTour} 
              onSkip={completeTour} 
            />
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-600 hover:text-gray-900"
          >
            <Bell className="h-5 w-5" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src={user?.avatarUrl} 
                    alt={user?.firstName || 'User'} 
                  />
                  <AvatarFallback>
                    {user?.firstName?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.firstName 
                      ? `${user.firstName} ${user.lastName || ''}` 
                      : 'Guest User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || 'guest@example.com'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <a className="w-full flex cursor-pointer items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <a className="w-full flex cursor-pointer items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={logout}
                className="cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default TopNavBar;
