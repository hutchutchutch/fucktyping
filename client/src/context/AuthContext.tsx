import React, { createContext, useContext, useState, useEffect } from "react";

// Define the User type
export interface User {
  id: number;
  username?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  organization?: string;
  avatar?: string;
  role?: string;
}

// Define the context type
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  register?: (userData: any) => Promise<boolean>;
  logout: () => Promise<void> | void;
  updateProfile?: (profileData: any) => Promise<boolean>;
}

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  logout: () => {},
});

// Sample user data for development
const MOCK_USER: User = {
  id: 1,
  email: "demo@example.com",
  firstName: "Demo",
  lastName: "User",
  name: "Demo User",
  username: "demouser",
  role: "admin",
  organization: "Voice Form Inc."
};

// Auth provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount and auto-login as Demo User
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // In a real app, would verify session with API
        // For now, just simulate the process and auto-login as Demo User
        const hasSession = localStorage.getItem("auth_session");
        
        // Auto-login as Demo User
        setUser(MOCK_USER);
        if (!hasSession) {
          localStorage.setItem("auth_session", "active");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login handler
  const login = async (credentials: { email: string; password: string }): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Always succeed in demo mode
      setUser(MOCK_USER);
      localStorage.setItem("auth_session", "active");
      
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUser(null);
      localStorage.removeItem("auth_session");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Register handler
  const register = async (userData: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Always succeed in demo mode
      setUser(MOCK_USER);
      localStorage.setItem("auth_session", "active");
      
      return true;
    } catch (error) {
      console.error("Registration failed:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile handler
  const updateProfile = async (profileData: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update the user with new profile data
      setUser(current => 
        current ? { ...current, ...profileData } : null
      );
      
      return true;
    } catch (error) {
      console.error("Profile update failed:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isLoading, 
        login, 
        logout,
        register,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook for using auth context
export const useAuthContext = () => useContext(AuthContext);