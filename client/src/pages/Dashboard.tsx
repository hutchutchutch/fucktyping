import { useLocation } from "wouter";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import Stats from "@/components/dashboard/Stats";
import FormsList from "@/components/dashboard/FormsList";

export default function Dashboard() {
  const [, navigate] = useLocation();
  
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Monitor your form performance and responses
          </p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 text-white" 
          onClick={() => navigate("/forms/create")}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create New Form
        </Button>
      </div>

      <div className="mb-10">
        <h2 className="text-base font-medium text-gray-700 mb-6">Response Overview</h2>
        <Stats />
      </div>
      
      <div>
        <h2 className="text-base font-medium text-gray-700 mb-6">Recent Forms</h2>
        <FormsList />
      </div>
    </>
  );
}
