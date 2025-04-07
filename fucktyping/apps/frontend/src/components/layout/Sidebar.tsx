import { useLocation } from "wouter";
import { cn } from "./lib/utils";
import { useAuthContext } from "./context/AuthContext";
import {
  FileEdit,
  FileQuestion,
  Home,
  TestTube,
  LineChart,
  MoveRight,
  Bot,
  Sparkles,
  Send,
  Mic,
  HelpCircle,
} from "lucide-react";
import { Button } from "./components/ui/button";
import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: Date;
  action?: {
    name: string;
    path: string;
    icon: JSX.Element;
    className: string;
  };
}

export default function Sidebar() {
  const [location, navigate] = useLocation();
  const { user } = useAuthContext();
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with a greeting message and action options
  useEffect(() => {
    if (messages.length === 0) {
      const greeting: Message = {
        id: Date.now().toString(),
        sender: "assistant",
        text: "How can I help you today?",
        timestamp: new Date(),
      };
      
      setMessages([greeting]);
      
      // Add welcome message with action CTA after a short delay
      setTimeout(() => {
        const actionMessage: Message = {
          id: Date.now().toString(),
          sender: "assistant",
          text: "Here are some things you might want to do:",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, actionMessage]);
        
        // Add action buttons with a slight delay
        setTimeout(() => {
          // Using a forEach to add each action individually to avoid type issues
          quickActions.forEach(action => {
            const actionMsg: Message = {
              id: Date.now().toString() + Math.random(),
              sender: "assistant",
              text: "",
              timestamp: new Date(),
              action: action
            };
            setMessages(prev => [...prev, actionMsg]);
          });
          
          setShowChat(true);
        }, 500);
      }, 1000);
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simulate AI response
    setTimeout(() => {
      // Determine if we should show action buttons (33% chance)
      const showActionButtons = Math.random() < 0.33;
      
      if (showActionButtons) {
        // Show text response followed by an action button
        const suggestedAction = quickActions[Math.floor(Math.random() * quickActions.length)];
        const actionPrompts = [
          `Would you like to ${suggestedAction.name.toLowerCase()}?`,
          `I think it might be helpful to ${suggestedAction.name.toLowerCase()}.`,
          `Based on your recent activity, you might want to ${suggestedAction.name.toLowerCase()}.`
        ];
        
        const promptMessage: Message = {
          id: Date.now().toString(),
          sender: "assistant",
          text: actionPrompts[Math.floor(Math.random() * actionPrompts.length)],
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, promptMessage]);
        
        // Add action button after a short delay
        setTimeout(() => {
          const actionMessage: Message = {
            id: Date.now().toString() + Math.random(),
            sender: "assistant",
            text: "",
            timestamp: new Date(),
            action: suggestedAction
          };
          setMessages((prev) => [...prev, actionMessage]);
        }, 500);
      } else {
        // Standard text responses
        const responses = [
          "I can help you analyze your form results. Would you like to see your completion rates or sentiment analysis?",
          "Creating voice-enabled forms is easy! Would you like me to walk you through the process?",
          "Based on your form responses, participants seem most engaged with the multiple-choice questions. Consider adding more of those.",
          "I notice you have a few forms in your dashboard. Would you like suggestions on how to optimize them for better completion rates?",
          "Voice forms have 78% higher completion rates than text-only forms. Would you like to convert some of your existing forms to voice format?",
          "Looking at your response patterns, most users complete your forms on mobile devices. Let me suggest some mobile-friendly question types.",
        ];

        const aiMessage: Message = {
          id: Date.now().toString(),
          sender: "assistant",
          text: responses[Math.floor(Math.random() * responses.length)],
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);
      }
      
      setShowChat(true); // Expand the chat area when there's a conversation
    }, 1000);
  };

  const handleVoiceInput = () => {
    // Simulate voice input with a placeholder message
    const placeholderText = "This is a simulated voice transcription";
    handleSendMessage(placeholderText);
  };

  const isActive = (path: string) => {
    // Fix highlight issue for Create Form
    if (path === "/forms/new" && location === "/forms/new") {
      return true;
    }

    // For My Forms path, don't highlight when on Create Form page
    if (path === "/forms" && location === "/forms/new") {
      return false;
    }

    return (
      location === path ||
      (location.startsWith(`${path}/`) && !location.startsWith("/forms/new"))
    );
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
          subItems: [
            {
              name: "Customer Feedback",
              path: "/forms?category=customer-feedback",
            },
            {
              name: "Product Research",
              path: "/forms?category=product-research",
            },
            {
              name: "Event Registration",
              path: "/forms?category=event-registration",
            },
          ],
        },
      ],
    },
  ];

  // Quick Action CTAs
  const quickActions = [
    {
      name: "Review Form Results",
      path: "/responses",
      icon: <LineChart className="h-4 w-4" />,
      className:
        "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 cta-review-results",
    },
    {
      name: "Test Prior Forms",
      path: "/voice-agent-test",
      icon: <TestTube className="h-4 w-4" />,
      className:
        "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 cta-test-forms",
    },
    {
      name: "Explore Community Forms",
      path: "/community-forms",
      icon: <Sparkles className="h-4 w-4" />,
      className:
        "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200 cta-community-forms",
    },
  ];

  return (
    <>
      <aside className="hidden md:flex md:flex-col md:w-64 bg-white border-r border-gray-200 h-screen">
        <div
          className="p-4 border-b border-gray-200 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-primary mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                clipRule="evenodd"
              />
            </svg>
            <h1 className="text-xl font-bold font-sans">Voice Form Agent</h1>
          </div>
        </div>

        {/* Quick Action CTAs 
        <div className="p-4 space-y-2">
          {quickActions.map((action) => (
            <Button
              key={action.name}
              variant="outline"
              size="sm"
              className={cn(
                "w-full justify-start border text-sm font-medium h-9",
                action.className,
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
        */}

        <nav className="flex-1 overflow-y-auto p-4">
          {navItems.map((section) => (
            <div key={section.section} className="mb-8">
              <h3 className="text-xs uppercase font-semibold text-gray-500 mb-2">
                {section.section}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.path} className="mb-1">
                    <div
                      onClick={() => navigate(item.path)}
                      className={cn(
                        "flex items-center px-3 py-2 text-sm rounded-md cursor-pointer",
                        isActive(item.path)
                          ? "text-primary bg-primary/10 font-medium"
                          : "text-gray-700 hover:bg-gray-100",
                      )}
                    >
                      <span
                        className={cn(
                          isActive(item.path)
                            ? "text-primary"
                            : "text-gray-700",
                        )}
                      >
                        {item.icon}
                      </span>
                      {item.name}
                    </div>

                    {/* SubItems for hierarchical navigation */}
                    {item.subItems && (
                      <ul className="pl-8 mt-1 space-y-1">
                        {item.subItems.map((subItem) => (
                          <li key={subItem.path}>
                            <div
                              onClick={() => navigate(subItem.path)}
                              className={cn(
                                "flex items-center px-3 py-1.5 text-sm rounded-md cursor-pointer",
                                isActive(subItem.path)
                                  ? "text-primary bg-primary/5 font-medium"
                                  : "text-gray-600 hover:bg-gray-50",
                              )}
                            >
                              <span
                                className="w-2 h-2 rounded-full mr-2"
                                style={{
                                  backgroundColor:
                                    subItem.name === "Customer Feedback"
                                      ? "#3b82f6"
                                      : subItem.name === "Product Research"
                                        ? "#10b981"
                                        : "#8b5cf6",
                                }}
                              ></span>
                              {subItem.name}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* AI Assistant - Integrated with sidebar */}
        <div className="px-4 pt-3 mt-auto border-t border-gray-200">
          <h3 className="text-xs uppercase font-semibold text-gray-500 mb-3 flex items-center">
            AI ASSISTANT <Sparkles className="h-3 w-3 text-yellow-500 ml-1" />
          </h3>

          {/* Chat area without card background */}
          <div className="flex flex-col">
            {showChat && (
              <div className="overflow-y-auto mb-3 space-y-2 max-h-60">
                {messages.map((message) => {
                  if (message.action) {
                    // Extract action properties safely
                    const { 
                      path = "/", 
                      name = "Action", 
                      icon = null, 
                      className = "" 
                    } = message.action;
                    
                    return (
                      <Button
                        key={message.id}
                        variant="outline"
                        size="sm"
                        className={cn(
                          "w-full justify-start border text-sm font-medium h-9 mb-1", 
                          className
                        )}
                        onClick={() => navigate(path)}
                      >
                        <span className="flex items-center">
                          {icon}
                          <span className="ml-2">{name}</span>
                        </span>
                      </Button>
                    );
                  } else {
                    // Regular text message
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "px-3 py-2 rounded text-sm",
                          message.sender === "assistant"
                            ? "bg-indigo-100 text-indigo-900"
                            : "bg-blue-100 text-blue-900 ml-4",
                        )}
                      >
                        {message.text}
                      </div>
                    );
                  }
                })}
                <div ref={messagesEndRef} />
              </div>
            )}

            <div className="flex flex-col space-y-3">
              {!showChat && (
                <div className="flex items-center">
                  <Bot className="h-4 w-4 text-indigo-500 mr-2" />
                  <span className="text-sm text-indigo-800">
                    How can I help you today?
                  </span>
                </div>
              )}

              {/* Full-width input field */}
              <div className="relative w-full">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleSendMessage(inputValue)
                  }
                  placeholder="Type a message..."
                  className="w-full h-9 px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-7 w-7 p-0 text-gray-500"
                  onClick={() => handleSendMessage(inputValue)}
                  disabled={!inputValue.trim()}
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
              
              {/* Voice input option below */}
              <button
                className="flex items-center justify-center text-xs text-gray-600 hover:text-indigo-600 transition-colors"
                onClick={handleVoiceInput}
                type="button"
              >
                <Mic className="h-3 w-3 mr-1" />
                Rather talk than type?
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}