import { Switch, Route, Redirect } from 'wouter';
import { useAuthContext } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import FormBuilder from './pages/FormBuilder';
import FormResponder from './pages/FormResponder';
import Login from './pages/Login';
import NotFound from './pages/not-found';

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
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={Login} />
      
      {/* Protected routes */}
      <Route path="/dashboard">
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
      
      {/* Public form response page */}
      <Route path="/forms/:id/respond" component={FormResponder} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}
