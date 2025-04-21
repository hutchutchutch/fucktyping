import { useState } from 'react';
import { useLocation } from "wouter";
import { PlusIcon, Cog6ToothIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "@ui/button";
import Stats from "@components/dashboard/Stats";
import FormsList from "@/components/dashboard/FormsList";
import ResponseViewer from "@/components/dashboard/ResponseViewer";
import Analytics from '@/components/dashboard/Analytics';
import { useAuthContext } from '@context/AuthContext';

export default function Dashboard() {
  const { user } = useAuthContext();
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('overview');

  // Sample statistics data for Analytics component
  const statsData = {
    activeForms: 8,
    totalResponses: 124,
    responseRate: "76%",
    weeklyResponses: [
      { name: "Mon", responses: 12 },
      { name: "Tue", responses: 19 },
      { name: "Wed", responses: 14 },
      { name: "Thu", responses: 21 },
      { name: "Fri", responses: 18 },
      { name: "Sat", responses: 8 },
      { name: "Sun", responses: 6 },
    ],
    formPerformance: [
      { name: "Feedback", responses: 42, completion: 85 },
      { name: "Job App", responses: 16, completion: 92 },
      { name: "Survey", responses: 38, completion: 78 },
      { name: "Contact", responses: 28, completion: 64 },
    ],
  };
  
  // Handle route-based content (from the .tsx version)
  const renderRouteContent = () => {
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
            <ResponseViewer formId="someFormId" responseId="someResponseId" />
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
      // If we're on the main dashboard page, use the tab-based UI from the .jsx version
      return renderTabContent();
    }
  };

  // Tab-based content (from the .jsx version)
  const renderTabContent = () => {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-sans">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.firstName || 'Guest'}. Here's an overview of your forms.
          </p>
        </div>

        {/* Dashboard Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === 'overview' 
                    ? 'border-primary-500 text-primary-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('forms')}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === 'forms' 
                    ? 'border-primary-500 text-primary-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                My Forms
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === 'analytics' 
                    ? 'border-primary-500 text-primary-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                Analytics
              </button>
            </nav>
          </div>
        </div>

        {/* Dashboard Content */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-primary-100 text-primary-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Active Forms</h3>
                    <p className="text-2xl font-semibold">{statsData.activeForms}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Total Responses</h3>
                    <p className="text-2xl font-semibold">{statsData.totalResponses}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-amber-100 text-amber-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">Response Rate</h3>
                    <p className="text-2xl font-semibold">{statsData.responseRate}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Forms */}
            <div className="mb-8">
              <FormsList />
            </div>
            
            {/* Recent Responses */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Recent Responses</h2>
                <button className="text-primary-500 text-sm hover:underline">View all</button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-5 max-w-[400px] w-full mx-auto md:mx-0">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium">Customer Feedback Survey</h3>
                      <p className="text-sm text-gray-500">Submitted 2 hours ago</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">New</span>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Overall satisfaction: <span className="font-medium">4/5</span></p>
                    <p className="text-sm text-gray-600 mb-1">Would recommend: <span className="font-medium">Yes</span></p>
                    <p className="text-sm text-gray-600">Additional comments: <span className="font-medium">Great service, would use again!</span></p>
                  </div>
                  <div className="flex justify-end">
                    <button className="text-gray-500 text-sm hover:text-gray-700 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Send Email
                    </button>
                    <button className="text-primary-500 text-sm hover:text-primary-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Details
                    </button>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-5 max-w-[400px] w-full mx-auto md:mx-0">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium">Job Application</h3>
                      <p className="text-sm text-gray-500">Submitted 5 hours ago</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">New</span>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Applicant: <span className="font-medium">Sarah Johnson</span></p>
                    <p className="text-sm text-gray-600 mb-1">Position: <span className="font-medium">Frontend Developer</span></p>
                    <p className="text-sm text-gray-600">Years of experience: <span className="font-medium">3 years</span></p>
                  </div>
                  <div className="flex justify-end">
                    <button className="text-gray-500 text-sm hover:text-gray-700 mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Send Email
                    </button>
                    <button className="text-primary-500 text-sm hover:text-primary-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'forms' && (
          <FormsList />
        )}

        {activeTab === 'analytics' && (
          <Analytics stats={statsData} />
        )}
      </div>
    );
  };
  
  return (
    <div className="max-w-[1200px] mx-auto w-full px-4">
      {renderRouteContent()}
    </div>
  );
}
