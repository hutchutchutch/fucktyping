import { queryClient } from "@lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@ui/toaster";
import { FormProvider } from "@context/FormContext";
import { AuthProvider } from "@context/AuthContext";
// @ts-ignore - Importing JSX file without type definitions
import Routes from "@app/routes";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FormProvider>
          <Routes />
          <Toaster />
        </FormProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
