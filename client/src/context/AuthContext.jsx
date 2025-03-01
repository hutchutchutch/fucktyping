import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "../services/api";
import { useNotification } from "../components/common/Notification";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [, navigate] = useLocation();
  const notification = useNotification();

  // Load user from session on initial mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Failed to load user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // For demo purposes, simulate a logged in user
    const simulateUser = () => {
      const demoUser = {
        id: 1,
        username: "johnsmith",
        email: "john@example.com",
        firstName: "John",
        lastName: "Smith",
      };
      setUser(demoUser);
      setIsAuthenticated(true);
      setIsLoading(false);
    };

    // Uncomment this in real implementation
    // loadUser();
    
    // For demo purposes
    simulateUser();
  }, []);

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      const data = await response.json();
      
      setUser(data.user);
      setIsAuthenticated(true);
      notification.success("Successfully logged in");
      navigate("/dashboard");
      return true;
    } catch (error) {
      notification.error(error.message || "Login failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/auth/register", userData);
      const data = await response.json();
      
      setUser(data.user);
      setIsAuthenticated(true);
      notification.success("Account created successfully");
      navigate("/dashboard");
      return true;
    } catch (error) {
      notification.error(error.message || "Registration failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await apiRequest("POST", "/api/auth/logout");
      setUser(null);
      setIsAuthenticated(false);
      notification.info("You have been logged out");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setIsLoading(true);
      const response = await apiRequest("PATCH", "/api/auth/profile", profileData);
      const data = await response.json();
      
      setUser({
        ...user,
        ...data
      });
      notification.success("Profile updated successfully");
      return true;
    } catch (error) {
      notification.error(error.message || "Failed to update profile");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
