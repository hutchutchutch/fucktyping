import { Switch, Route, useLocation } from "wouter";
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
import AppLayout from "@/components/layout/AppLayout";

function Router() {
  const [location] = useLocation();
  
  // Check if the current path is a form responder path, which might need a different layout
  const needsFullLayout = !location.includes('/forms/') || location.includes('/forms/edit/') || location.includes('/forms/new') || location.includes('/forms/create');
  
  if (needsFullLayout) {
    return (
      <AppLayout>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/forms" component={Dashboard} />
          <Route path="/responses" component={Dashboard} />
          <Route path="/settings" component={Dashboard} />
          <Route path="/help" component={Dashboard} />
          <Route path="/forms/new/" component={FormBuilder} />
          <Route path="/forms/new" component={FormBuilder} />
          <Route path="/forms/create/" component={FormBuilder} />
          <Route path="/forms/create" component={FormBuilder} />
          <Route path="/forms/edit/:id" component={FormBuilder} />
          <Route path="/forms/:id/responses" component={ResponseViewer} />
          <Route component={NotFound} />
        </Switch>
      </AppLayout>
    );
  }
  
  // For form responder, use a simplified layout
  return (
    <Switch>
      <Route path="/forms/:id/respond" component={FormResponder} />
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
