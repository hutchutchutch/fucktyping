import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      
      <div className="flex flex-col flex-1 md:ml-64 overflow-y-auto">
        <Header />
        
        <main className="flex-1 px-6 py-8 mx-auto max-w-screen-xl w-full">
          {children}
        </main>
        
        <MobileNav />
      </div>
    </div>
  );
}