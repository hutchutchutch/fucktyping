import { useLocation } from "wouter";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import Stats from "@/components/dashboard/Stats";
import FormsList from "@/components/dashboard/FormsList";

export default function Dashboard() {
  const [, navigate] = useLocation();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          <div className="pb-5 border-b border-gray-200 sm:flex sm:items-center sm:justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Dashboard</h3>
            <div className="mt-3 flex sm:mt-0 sm:ml-4">
              <Button onClick={() => navigate("/forms/create")}>
                <Plus className="h-5 w-5 mr-2" />
                Create New Form
              </Button>
            </div>
          </div>

          <Stats />
          
          <h2 className="mt-8 text-lg font-medium text-gray-900">Recent Forms</h2>
          <FormsList />
        </main>
      </div>
      
      <MobileNav />
    </div>
  );
}
