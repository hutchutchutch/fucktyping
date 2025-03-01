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
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <Button 
              className="bg-primary hover:bg-primary/90 text-white" 
              onClick={() => navigate("/forms/create")}
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New Form
            </Button>
          </div>

          <Stats />
          
          <h2 className="mt-10 mb-6 text-xl font-semibold">Recent Forms</h2>
          <FormsList />
        </main>
      </div>
      
      <MobileNav />
    </div>
  );
}
