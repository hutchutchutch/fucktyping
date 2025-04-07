declare module "./context/AuthContext" {
  interface User {
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

  interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: { email: string; password: string }) => Promise<boolean>;
    register?: (userData: any) => Promise<boolean>;
    logout: () => Promise<void> | void;
    updateProfile?: (profileData: any) => Promise<boolean>;
  }

  export function AuthProvider(props: { children: React.ReactNode }): JSX.Element;
  export function useAuthContext(): AuthContextType;
}

declare module "./AuthContext" {
  export * from "./context/AuthContext";
}