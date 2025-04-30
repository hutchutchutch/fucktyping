import React from 'react';
import Header from '@components/layout/Header';
import Sidebar from '@components/layout/Sidebar';
import MobileNav from '@components/layout/MobileNav';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-y-auto">
        <Header />
        
        <main className="flex-1 px-6 py-8 w-full">
          {children}
        </main>
        
        <MobileNav />
      </div>
    </div>
  );
}