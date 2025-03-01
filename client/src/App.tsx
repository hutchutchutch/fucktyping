import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import FormBuilder from "@/pages/FormBuilder";
import FormResponder from "@/pages/FormResponder";
import ResponseViewer from "@/pages/ResponseViewer";
import { FormProvider } from "@/context/FormContext";
import { AuthProvider } from "@/context/AuthContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/forms/create" component={FormBuilder} />
      <Route path="/forms/edit/:id" component={FormBuilder} />
      <Route path="/forms/:id/respond" component={FormResponder} />
      <Route path="/forms/:id/responses" component={ResponseViewer} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FormProvider>
          <Router />
          <Toaster />
        </FormProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
