import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="md:pl-64 flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-1 px-6 py-8">
          {children}
        </main>
      </div>
      
      <MobileNav />
    </div>
  );
}