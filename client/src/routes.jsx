import { Switch, Route, Redirect, useLocation } from 'wouter';
import { useAuthContext } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import FormBuilder from './pages/FormBuilder';
import FormResponder from './pages/FormResponder';
import ResponseViewer from './pages/ResponseViewer';
import FormsPage from './pages/FormsPage';
import ResponsesPage from './pages/ResponsesPage';
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
  
  // Check if the path needs full layout with sidebar and header
  const needsFullLayout = location === '/dashboard' ||
                         location === '/forms' ||
                         location === '/responses' ||
                         location === '/settings' ||
                         location === '/help' ||
                         location.includes('/forms/edit/') || 
                         location.includes('/forms/new') || 
                         location.includes('/forms/create') ||
                         location.includes('/forms/:id/responses');
                         
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
  
  // For all other paths (landing page, login, and form responder)
  return (
    <Switch>
      {/* Public pages */}
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={Login} />
      
      {/* Public form response page */}
      <Route path="/forms/:id/respond" component={FormResponder} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}
