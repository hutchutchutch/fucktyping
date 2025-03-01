import { useLocation } from "wouter";
import { PlusIcon, Cog6ToothIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import Stats from "@/components/dashboard/Stats";
import FormsList from "@/components/dashboard/FormsList";
import ResponseViewer from "@/components/dashboard/ResponseViewer";

export default function Dashboard() {
  const [location, navigate] = useLocation();
  
  const renderPageContent = () => {
    // Handle different routes
    if (location === "/forms") {
      return (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Forms</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage and edit your interactive forms
              </p>
            </div>
            <Button 
              className="bg-primary hover:bg-primary/90 text-white" 
              onClick={() => navigate("/forms/new")}
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create New Form
            </Button>
          </div>
          
          <div>
            <h2 className="text-base font-medium text-gray-700 mb-6">All Forms</h2>
            <FormsList />
          </div>
        </>
      );
    } else if (location === "/responses") {
      return (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Responses</h1>
              <p className="mt-1 text-sm text-gray-500">
                View and analyze form responses
              </p>
            </div>
          </div>
          
          <div className="mb-10">
            <h2 className="text-base font-medium text-gray-700 mb-6">Response Overview</h2>
            <Stats />
          </div>
          
          <div>
            <h2 className="text-base font-medium text-gray-700 mb-6">Recent Responses</h2>
            <ResponseViewer />
          </div>
        </>
      );
    } else if (location === "/settings") {
      return (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Settings</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your account and application settings
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <div className="bg-gray-100 p-3 rounded-full">
                <Cog6ToothIcon className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="ml-4 text-lg font-medium">Account Settings</h3>
            </div>
            <p className="text-gray-500 mb-4">This section is under development. Account settings will be available soon.</p>
          </div>
        </>
      );
    } else if (location === "/help") {
      return (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Help & Support</h1>
              <p className="mt-1 text-sm text-gray-500">
                Get assistance with using Voice Form Agent
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center mb-6">
              <div className="bg-gray-100 p-3 rounded-full">
                <QuestionMarkCircleIcon className="h-6 w-6 text-gray-500" />
              </div>
              <h3 className="ml-4 text-lg font-medium">FAQ & Documentation</h3>
            </div>
            <p className="text-gray-500 mb-4">This section is under development. Help resources will be available soon.</p>
          </div>
        </>
      );
    } else {
      // Default dashboard view
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
              onClick={() => navigate("/forms/new")}
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
  };
  
  return (
    <>
      {renderPageContent()}
    </>
  );
}
