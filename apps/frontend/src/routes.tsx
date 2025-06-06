import { Switch, Route, Redirect, useLocation } from "wouter";
import { useAuthContext } from "@context/AuthContext";
import LandingPage from "@pages/LandingPage";
import Dashboard from "@pages/Dashboard";
import FormBuilder from "@pages/FormBuilder";
import CreateForm from "@pages/CreateForm";
import EditForm from "@pages/EditForm";
import TestForm from "@pages/TestForm";
import FormResponder from "@pages/FormResponder";
import ResponseViewer from "@pages/ResponseViewer";
import FormsPage from "@pages/FormsPage";
import ResponsesPage from "@pages/ResponsesPage";
import VoiceTest from "@pages/VoiceTest";
import VoiceAgentPage from "@pages/VoiceAgentPage";
import VoiceAgentTest from "@pages/VoiceAgentTest";
import WebRTCTest from "@pages/WebRTCTest";
import WebRTCAudioTest from "@pages/WebRTCAudioTest";
import TestUI from "@pages/TestUI";
import Login from "@/pages/Login";
import NotFound from "@pages/not-found";
import AppLayout from "@components/layout/AppLayout";
import { ComponentType } from "react";

function PrivateRoute({ component: Component, ...rest }: { component: ComponentType<any>; [key: string]: any }) {
  const { isAuthenticated, isLoading } = useAuthContext();

  // If still checking auth state, show nothing or a loading spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // If authenticated, render the component
  if (isAuthenticated) {
    return <Component {...rest} />;
  }

  // Otherwise, redirect to login
  return <Redirect to="/login" />;
}

export default function Routes() {
  const [location] = useLocation();

  // Check if the path needs full layout with sidebar and header
  const needsFullLayout =
    location === "/dashboard" ||
    location === "/forms" ||
    location === "/responses" ||
    location === "/settings" ||
    location === "/help" ||
    location.includes("/forms/edit/") ||
    location.includes("/forms/new") ||
    location.includes("/forms/create") ||
    (location.includes("/forms/") && location.includes("/responses"));

  // Include test form in full layout
  const isTestForm =
    location.includes("/forms/draft/test") || location.includes("/forms/test");

  // Add test form paths to the paths that need full layout
  if (isTestForm) {
    return (
      <AppLayout>
        <Switch>
          <Route path="/forms/draft/test/:id">
            {(params) => <PrivateRoute component={TestForm} params={params} />}
          </Route>

          <Route path="/forms/draft/test">
            {() => <PrivateRoute component={TestForm} />}
          </Route>

          <Route path="/forms/test/:id">
            {(params) => <PrivateRoute component={TestForm} params={params} />}
          </Route>

          <Route path="/forms/test">
            {() => <PrivateRoute component={TestForm} />}
          </Route>

          {/* Fallback for all other routes */}
          <Route>{() => <Redirect to="/forms" />}</Route>
        </Switch>
      </AppLayout>
    );
  }

  // For paths that need the full layout with sidebar
  if (needsFullLayout) {
    return (
      <AppLayout>
        <Switch>
          {/* Protected routes */}
          <Route path="/dashboard">
            {() => <PrivateRoute component={Dashboard} />}
          </Route>

          <Route path="/forms">
            {() => <PrivateRoute component={FormsPage} />}
          </Route>

          <Route path="/responses">
            {() => <PrivateRoute component={ResponsesPage} />}
          </Route>

          <Route path="/settings">
            {() => <PrivateRoute component={Dashboard} />}
          </Route>

          <Route path="/help">
            {() => <PrivateRoute component={Dashboard} />}
          </Route>

          <Route path="/forms/new">
            {() => <PrivateRoute component={CreateForm} />}
          </Route>

          <Route path="/forms/new/">
            {() => <PrivateRoute component={CreateForm} />}
          </Route>

          <Route path="/forms/edit/:id">
            {(params) => <PrivateRoute component={EditForm} params={params} />}
          </Route>

          <Route path="/forms/:id/responses">
            {(params) => (
              <PrivateRoute component={ResponseViewer} params={params} />
            )}
          </Route>

          {/* Public form response page */}
          <Route path="/forms/:id/respond" component={FormResponder} />

          {/* Fallback to 404 */}
          <Route component={NotFound} />
        </Switch>
      </AppLayout>
    );
  }

  // For all other paths (landing page, login, and form responder)
  return (
    <Switch>
      {/* Public pages */}
      <Route path="/" component={LandingPage} />
      <Route path="/landing" component={LandingPage} />
      <Route path="/login" component={Login} />
      <Route path="/voice-test" component={VoiceTest} />
      <Route path="/voice-agent" component={VoiceAgentPage} />
      <Route path="/voice-agent-test" component={VoiceAgentTest} />
      <Route path="/webrtc-test" component={WebRTCTest} />
      <Route path="/webrtc-audio-test" component={WebRTCAudioTest} />
      <Route path="/test-ui" component={TestUI} />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}