import { useLocation, Link } from "wouter";
import { Button } from "../components/ui/button";
import { useAuthContext } from "../context/AuthContext";
import { Badge } from "../components/ui/badge";
import DigitalRain from "../components/animation/DigitalRain";
import { 
  FileQuestion, 
  Mic, 
  MessageSquareText, 
  X, 
  ClipboardCheck, 
  Clock, 
  Briefcase, 
  MessageCircle, 
  PieChart, 
  Users 
} from "lucide-react";

export default function LandingPage() {
  const [, navigate] = useLocation();
  
  // Use auth context if it's available
  let isAuthenticated = false;
  try {
    const auth = useAuthContext();
    isAuthenticated = auth?.isAuthenticated || false;
  } catch (error) {
    // Auth context might not be available, that's okay
    console.log("Auth context not available");
  }
  
  // Determine where to navigate on Get Started click
  const getStartedPath = isAuthenticated ? "/dashboard" : "/login";
  
  return (
    <div className="min-h-screen bg-white">
      {/* Bold Hero Section with Large Headlines */}
      <header className="relative overflow-hidden bg-white text-gray-900">
        <DigitalRain color="#2a4365" opacity={0.05} speed={1.2} density={0.03} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="w-full lg:w-1/2 pr-0 lg:pr-12 mb-10 lg:mb-0">
              <div className="text-left">
                <h2 className="text-3xl font-bold text-red-400 mb-2">Users Hate Forms</h2>
                <h3 className="text-3xl font-bold text-yellow-400 mb-6">Leads Slip Away</h3>
                <h1 className="text-6xl sm:text-7xl md:text-8xl font-extrabold tracking-tight mt-2 mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                  f*ck typing
                </h1>
                <p className="mt-4 mb-8 text-xl text-gray-300 max-w-xl">
                  Let your users speak instead of type. Capture all the details they want to share, 
                  not just what you asked for.
                </p>
                <Link href="/forms/new">
                  <Button size="lg" className="px-8 py-6 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg">
                    Create Voice Agent Form <Mic className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="bg-white p-4 rounded-lg shadow-xl transform rotate-2 opacity-85 relative">
                <div className="absolute -top-3 -right-3">
                  <div className="bg-red-500 text-white rounded-full p-2">
                    <X className="h-6 w-6" />
                  </div>
                </div>
                <div className="overflow-hidden">
                  <div className="bg-gray-100 p-3 rounded-t-md">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="ml-2 text-sm text-gray-600">Overwhelming Form</div>
                    </div>
                  </div>
                  <div className="p-4 border-t">
                    <div className="flex flex-col space-y-4">
                      <div className="border border-gray-300 p-3 rounded">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Full Legal Name <span className="text-red-500">*</span></label>
                        <input className="border border-gray-300 rounded w-full py-2 px-3" type="text" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="border border-gray-300 p-3 rounded">
                          <label className="block text-gray-700 text-sm font-bold mb-2">Email <span className="text-red-500">*</span></label>
                          <input className="border border-gray-300 rounded w-full py-2 px-3" type="email" />
                        </div>
                        <div className="border border-gray-300 p-3 rounded">
                          <label className="block text-gray-700 text-sm font-bold mb-2">Phone <span className="text-red-500">*</span></label>
                          <input className="border border-gray-300 rounded w-full py-2 px-3" type="tel" />
                        </div>
                      </div>
                      <div className="border border-gray-300 p-3 rounded">
                        <label className="block text-gray-700 text-sm font-bold mb-2">Address <span className="text-red-500">*</span></label>
                        <input className="border border-gray-300 rounded w-full py-2 px-3 mb-2" type="text" placeholder="Street Address" />
                        <input className="border border-gray-300 rounded w-full py-2 px-3 mb-2" type="text" placeholder="Apt, Suite, Bldg" />
                        <div className="grid grid-cols-3 gap-2">
                          <input className="border border-gray-300 rounded py-2 px-3" type="text" placeholder="City" />
                          <input className="border border-gray-300 rounded py-2 px-3" type="text" placeholder="State" />
                          <input className="border border-gray-300 rounded py-2 px-3" type="text" placeholder="ZIP" />
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-4">
                        Page 1 of 7 (32 fields remaining)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Pain Points Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              The Problems with Traditional Forms
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Traditional forms create friction that costs you valuable data and leads
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pain Point 1 */}
            <div className="bg-gray-50 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
              <div className="p-1 bg-gradient-to-r from-red-500 to-pink-500"></div>
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Form Fatigue</h3>
                <p className="text-gray-600 mb-6">
                  Users are overwhelmed when forms are too long, leading to high abandonment rates and incomplete data.
                </p>
                <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                  Reduced Completion Rates
                </Badge>
              </div>
            </div>

            {/* Pain Point 2 */}
            <div className="bg-gray-50 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
              <div className="p-1 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                  <ClipboardCheck className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Missing Context</h3>
                <p className="text-gray-600 mb-6">
                  Businesses miss out on extra details they didn't explicitly ask for, losing valuable insights.
                </p>
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                  Limited Insights
                </Badge>
              </div>
            </div>

            {/* Pain Point 3 */}
            <div className="bg-gray-50 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
              <div className="p-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Costly Research</h3>
                <p className="text-gray-600 mb-6">
                  Traditional surveying methods are expensive and time-consuming, with high costs for meaningful data.
                </p>
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                  High Research Costs
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Voice Forms: The Better Way
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Let your users speak naturally while our AI captures all the details
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
            {/* Benefit 1 */}
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-indigo-100 rounded-full opacity-50"></div>
              <div className="relative bg-white rounded-xl shadow-md p-6 z-10">
                <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center mb-6">
                  <MessageCircle className="h-7 w-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Natural Conversations</h3>
                <p className="text-gray-600">
                  Users respond in a casual, conversational tone through voice, making the experience feel more human and engaging.
                </p>
                <div className="mt-6 flex items-center">
                  <Mic className="h-5 w-5 text-indigo-500 mr-2" />
                  <span className="text-sm font-medium text-indigo-600">3x higher engagement rates</span>
                </div>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="relative mt-8 lg:mt-12">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-purple-100 rounded-full opacity-50"></div>
              <div className="relative bg-white rounded-xl shadow-md p-6 z-10">
                <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-6">
                  <MessageSquareText className="h-7 w-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Detailed Expansion</h3>
                <p className="text-gray-600">
                  Users can freely expand on key aspects they care about, giving you richer data beyond the original questions.
                </p>
                <div className="mt-6 flex items-center">
                  <FileQuestion className="h-5 w-5 text-purple-500 mr-2" />
                  <span className="text-sm font-medium text-purple-600">78% more detailed responses</span>
                </div>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="relative mt-8 lg:mt-24">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-100 rounded-full opacity-50"></div>
              <div className="relative bg-white rounded-xl shadow-md p-6 z-10">
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                  <PieChart className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">AI-Powered Insights</h3>
                <p className="text-gray-600">
                  Our AI analyzes voice responses to extract customer sentiment, key themes, and actionable feedback.
                </p>
                <div className="mt-6 flex items-center">
                  <Users className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-sm font-medium text-blue-600">Deeper customer understanding</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="lg:w-1/2 pr-0 lg:pr-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Powerful Analytics Dashboard
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Visualize response data, analyze sentiment, and identify key trends. 
                All your voice form responses in one intuitive interface.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                      <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">Real-time transcriptions</h4>
                    <p className="mt-1 text-gray-600">See voice responses converted to text instantly</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                      <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">Sentiment analysis</h4>
                    <p className="mt-1 text-gray-600">Understand the emotional tone behind responses</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-green-100">
                      <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">Theme extraction</h4>
                    <p className="mt-1 text-gray-600">Identify common topics and patterns across responses</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-10 lg:mt-0 lg:w-1/2">
              <div className="relative rounded-2xl shadow-xl bg-white p-2 transform rotate-1">
                <img 
                  src="/dashboard-screenshot.png" 
                  alt="Dashboard Preview" 
                  className="rounded-lg shadow-inner"
                  onError={(e) => { 
                    e.currentTarget.src = "https://placehold.co/600x400/e2e8f0/64748b?text=Dashboard+Preview"; 
                  }}
                />
                <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg pointer-events-none"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold sm:text-4xl mb-6">
            <span className="block">Stop losing leads with bad forms.</span>
            <span className="block">Start the conversation.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-indigo-100 mb-8">
            Create your first voice form in minutes and get responses that matter.
          </p>
          <Link href={getStartedPath}>
            <Button
              size="lg"
              className="px-8 py-6 text-lg bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg"
            >
              <span>Create My First Voice Form</span>
              <Mic className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center mb-4 md:mb-0">
              <Mic className="h-8 w-8 text-indigo-400 mr-2" />
              <span className="text-xl font-bold">Voice Form Agent</span>
            </div>
            <nav className="flex space-x-6">
              <a href="#" className="text-gray-300 hover:text-white">Features</a>
              <a href="#" className="text-gray-300 hover:text-white">Pricing</a>
              <a href="#" className="text-gray-300 hover:text-white">Documentation</a>
              <a href="#" className="text-gray-300 hover:text-white">Support</a>
            </nav>
          </div>
          <p className="text-center text-gray-400">
            &copy; {new Date().getFullYear()} Voice Form Agent, Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}