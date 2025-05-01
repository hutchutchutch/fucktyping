import { useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuthContext } from "@context/AuthContext";
import Sidebar from "@components/layout/Sidebar";
import TopNavBar from "@components/layout/TopNavBar";
import MobileNav from "@components/layout/MobileNav";

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const [showSidebar, setShowSidebar] = useState(false);
  const { isAuthenticated } = useAuthContext();
  const [location] = useLocation();
  
  // Public routes that don't need authentication or layout
  const isPublicRoute = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
  ].includes(location) || location.startsWith('/forms/') && location.includes('/respond');

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        showSidebar &&
        !(e.target as Element).closest('aside') &&
        !(e.target as Element).closest('button[data-sidebar-toggle]')
      ) {
        setShowSidebar(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [showSidebar]);

  // Reset sidebar state on route change
  useEffect(() => {
    setShowSidebar(false);
  }, [location]);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // If it's a public route, don't show the layout
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // If not authenticated and not on a public route, handle auth flow
  // For now, we'll just render the children since auth is not fully implemented
  
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for desktop view */}
      <Sidebar />
      
      {/* Mobile sidebar overlay */}
      {showSidebar && (
        <div className="md:hidden fixed inset-0 z-50">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={toggleSidebar}
          ></div>
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
            <Sidebar />
          </div>
        </div>
      )}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavBar onToggleSidebar={toggleSidebar} />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          {children}
        </main>
        
        {/* Mobile bottom navigation */}
        <MobileNav />
      </div>
    </div>
  );
}

export default Layout;
