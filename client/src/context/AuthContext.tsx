import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define user interface
interface User {
  id: number;
  name: string;
  email: string;
}

// Define AuthContext interface
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // In a real app, this would make an API call to your auth service
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Mock authentication - in a real app, this would be an API call
      // For demo purposes, we'll just set a mock user after a short delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUser({
        id: 1,
        name: 'Demo User',
        email: email
      });
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = () => {
    setUser(null);
  };
  
  // For development purposes, automatically log in a test user
  useEffect(() => {
    // Using timeout to simulate async login
    setTimeout(() => {
      setUser({
        id: 1,
        name: 'Demo User',
        email: 'demo@example.com'
      });
    }, 100);
  }, []);
  
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use the auth context
export function useAuthContext() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  
  return context;
}