import { useState } from "react";
import { useLocation } from "wouter";
import { useAuthContext } from "./context/AuthContext";
import { Button } from "./components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "./components/ui/dropdown-menu";
import { Input } from "./components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "./components/ui/dialog";
import { 
  ArrowRightOnRectangleIcon, 
  UserCircleIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon
} from "@heroicons/react/24/outline";

export default function UserMenu() {
  const { user, isAuthenticated, login, logout } = useAuthContext();
  const [, navigate] = useLocation();
  const [loginOpen, setLoginOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      await login({ email, password });
      setLoginOpen(false);
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  if (!isAuthenticated) {
    return (
      <>
        <Button variant="outline" size="sm" onClick={() => setLoginOpen(true)}>
          Sign In
        </Button>
        
        <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sign In</DialogTitle>
              <DialogDescription>
                Enter your credentials to sign in to your account.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleLogin}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">Password</label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="submit" disabled={isLoggingIn}>
                  {isLoggingIn ? "Signing In..." : "Sign In"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </>
    );
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-purple-100 text-primary">
            {user?.name ? user.name.charAt(0).toUpperCase() : <UserCircleIcon className="h-5 w-5" />}
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 pt-2 pb-3">
          <div className="flex flex-col">
            <p className="font-medium text-sm">{user?.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
          </div>
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="py-2 cursor-pointer">
          <UserCircleIcon className="h-4 w-4 mr-2 text-gray-600" />
          <span>Account</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => navigate("/settings")}
          className="py-2 cursor-pointer"
        >
          <Cog6ToothIcon className="h-4 w-4 mr-2 text-gray-600" />
          <span>Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => navigate("/help")}
          className="py-2 cursor-pointer"
        >
          <QuestionMarkCircleIcon className="h-4 w-4 mr-2 text-gray-600" />
          <span>Help & Support</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={logout}
          className="text-red-600 py-2 cursor-pointer"
        >
          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}