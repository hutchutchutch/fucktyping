import { Switch, Route, Redirect, useLocation } from 'wouter';
import { useAuthContext } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import FormBuilder from './pages/FormBuilder';
import FormResponder from './pages/FormResponder';
import ResponseViewer from './pages/ResponseViewer';
import Login from './pages/Login';
import NotFound from './pages/not-found';
import AppLayout from './components/layout/AppLayout';

function PrivateRoute({ component: Component, ...rest }) {
  const { isAuthenticated, isLoading } = useAuthContext();
  
  // If still checking auth state, show nothing or a loading spinner
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>;
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
  
  // Check if the current path is a form responder path, which might need a different layout
  const needsFullLayout = !location.includes('/forms/') || 
                         location.includes('/forms/edit/') || 
                         location.includes('/forms/new') || 
                         location.includes('/forms/create') ||
                         location.includes('/dashboard') ||
                         location.includes('/settings') ||
                         location.includes('/help') ||
                         location.includes('/responses');
                         
  // If it's a path that needs the full layout with sidebar                       
  if (needsFullLayout) {
    return (
      <AppLayout>
        <Switch>
          <Route path="/" component={LandingPage} />
          <Route path="/login" component={Login} />
          
          {/* Protected routes */}
          <Route path="/dashboard">
            {() => <PrivateRoute component={Dashboard} />}
          </Route>
          
          <Route path="/forms">
            {() => <PrivateRoute component={Dashboard} />}
          </Route>
          
          <Route path="/responses">
            {() => <PrivateRoute component={Dashboard} />}
          </Route>
          
          <Route path="/settings">
            {() => <PrivateRoute component={Dashboard} />}
          </Route>
          
          <Route path="/help">
            {() => <PrivateRoute component={Dashboard} />}
          </Route>
          
          <Route path="/forms/new">
            {() => <PrivateRoute component={FormBuilder} />}
          </Route>
          
          <Route path="/forms/new/">
            {() => <PrivateRoute component={FormBuilder} />}
          </Route>
          
          <Route path="/forms/edit/:id">
            {(params) => <PrivateRoute component={FormBuilder} params={params} />}
          </Route>
          
          <Route path="/forms/:id/responses">
            {(params) => <PrivateRoute component={ResponseViewer} params={params} />}
          </Route>
          
          {/* Fallback to 404 */}
          <Route component={NotFound} />
        </Switch>
      </AppLayout>
    );
  }
  
  // For form responder, use a simplified layout
  return (
    <Switch>
      {/* Public form response page */}
      <Route path="/forms/:id/respond" component={FormResponder} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}
