import { queryClient } from "@/lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { FormProvider } from "@/context/FormContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
// @ts-ignore - Importing JSX file without type definitions
import Routes from "@/routes";

// Import styles
import "./styles/win95.css";

// Import the Windows 95 font
import "@fontsource/press-start-2p";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <FormProvider>
            <Routes />
            <Toaster />
          </FormProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
