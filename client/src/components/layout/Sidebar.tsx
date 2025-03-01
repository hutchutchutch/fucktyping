import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuthContext } from "../../context/AuthContext";
import {
  BarChart,
  FileEdit,
  FileQuestion,
  Home,
  Settings,
  MessageSquare,
  PlusCircle,
  TestTube,
  LineChart,
  MoveRight,
  Bot,
  Sparkles,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import AIAssistantPopup from "@/components/ai/AIAssistantPopup";
import SimpleTour from "@/components/onboarding/SimpleTour";

export default function Sidebar() {
  const [location, navigate] = useLocation();
  const { user } = useAuthContext();
  const [showAssistant, setShowAssistant] = useState(false);
  const [showTour, setShowTour] = useState(false);
  
  // Check if this is the first visit (in a real app, this would check user preferences)
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      // Wait a moment before showing the tour to let the page load
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);
  
  const completeTour = () => {
    setShowTour(false);
    localStorage.setItem('hasSeenTour', 'true');
  };

  const isActive = (path: string) => {
    return location === path || location.startsWith(`${path}/`);
  };

  // Navigation items organized by sections
  const navItems = [
    {
      section: "Main",
      items: [
        {
          name: "Dashboard",
          path: "/dashboard",
          icon: <Home className="h-5 w-5 mr-3" />,
        },
        {
          name: "Create Form",
          path: "/forms/new",
          icon: <FileEdit className="h-5 w-5 mr-3" />,
        },
        {
          name: "My Forms",
          path: "/forms",
          icon: <FileQuestion className="h-5 w-5 mr-3" />,
        },
        {
          name: "Responses",
          path: "/responses",
          icon: <BarChart className="h-5 w-5 mr-3" />,
        },
        {
          name: "Settings",
          path: "/settings",
          icon: <Settings className="h-5 w-5 mr-3" />,
        }
      ],
    },
  ];

  // Quick Action CTAs
  const quickActions = [
    {
      name: "Review Form Results",
      path: "/responses",
      icon: <LineChart className="h-4 w-4" />,
      className: "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 cta-review-results"
    },
    {
      name: "Generate New Form",
      path: "/forms/new",
      icon: <PlusCircle className="h-4 w-4" />,
      className: "bg-green-50 hover:bg-green-100 text-green-700 border-green-200 cta-generate-form"
    },
    {
      name: "Test Prior Forms",
      path: "/voice-agent-test",
      icon: <TestTube className="h-4 w-4" />,
      className: "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 cta-test-forms"
    }
  ];

  return (
    <>
      {/* Product Tour */}
      {showTour && (
        <SimpleTour 
          onComplete={completeTour} 
          onSkip={completeTour} 
        />
      )}
      
      {/* AI Assistant Popup */}
      <AIAssistantPopup 
        isOpen={showAssistant} 
        onClose={() => setShowAssistant(false)} 
      />
      
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200 h-screen">
        <div 
          className="p-4 border-b border-gray-200 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
            <h1 className="text-xl font-bold font-sans">Voice Form Agent</h1>
          </div>
        </div>
        
        {/* Quick Action CTAs */}
        <div className="p-4 space-y-2">
          {quickActions.map((action) => (
            <Button
              key={action.name}
              variant="outline"
              size="sm"
              className={cn(
                "w-full justify-start border text-sm font-medium h-9", 
                action.className
              )}
              onClick={() => navigate(action.path)}
            >
              <span className="flex items-center">
                {action.icon}
                <span className="ml-2">{action.name}</span>
              </span>
            </Button>
          ))}
        </div>
        
        {/* Category section for demo */}
        <div className="px-4 mb-2 category-section">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs uppercase font-semibold text-gray-500">
              Categories
            </h3>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <PlusCircle className="h-4 w-4 text-gray-500" />
            </Button>
          </div>
          <div className="space-y-1">
            <div className="text-sm flex items-center justify-between px-2 py-1 rounded hover:bg-gray-100 cursor-pointer">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                Customer Feedback
              </span>
              <span className="text-xs text-gray-500">8</span>
            </div>
            <div className="text-sm flex items-center justify-between px-2 py-1 rounded hover:bg-gray-100 cursor-pointer">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                Product Research
              </span>
              <span className="text-xs text-gray-500">5</span>
            </div>
            <div className="text-sm flex items-center justify-between px-2 py-1 rounded hover:bg-gray-100 cursor-pointer">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
                Event Registration
              </span>
              <span className="text-xs text-gray-500">3</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          {navItems.map((section) => (
            <div key={section.section} className="mb-8">
              <h3 className="text-xs uppercase font-semibold text-gray-500 mb-2">
                {section.section}
              </h3>
              <ul>
                {section.items.map((item) => (
                  <li key={item.path} className="mb-1">
                    <div
                      onClick={() => navigate(item.path)}
                      className={cn(
                        "flex items-center px-3 py-2 text-sm rounded-md cursor-pointer",
                        isActive(item.path)
                          ? "text-primary bg-primary/10 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      )}
                    >
                      <span className={cn(
                        isActive(item.path) ? "text-primary" : "text-gray-700"
                      )}>
                        {item.icon}
                      </span>
                      {item.name}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-200 voice-agent-section">
          <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-indigo-900">Voice Forms</h3>
                  <p className="text-xs text-indigo-700 mt-1">Create forms with voice interaction</p>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-7 px-2 text-indigo-700 hover:text-indigo-900 hover:bg-indigo-100"
                  onClick={() => navigate("/voice-agent-test")}
                >
                  Try <MoveRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="p-4 border-t border-gray-200 flex gap-2">
          <Button 
            variant="outline"
            size="sm" 
            className="flex-1 flex items-center justify-start gap-2 h-10 ai-assistant-trigger"
            onClick={() => setShowAssistant(true)}
          >
            <Bot className="h-4 w-4 text-primary" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">AI Assistant</span>
              <span className="text-xs text-muted-foreground">Get help</span>
            </div>
            <Sparkles className="h-3 w-3 text-yellow-500 ml-auto" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="h-10 w-10 flex-shrink-0"
            onClick={() => setShowTour(true)}
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
      </aside>
    </>
  );
}
