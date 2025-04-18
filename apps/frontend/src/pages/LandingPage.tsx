import { useLocation } from "wouter";
import { useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { Computer, User, Mail, Folder, FolderExe, RecycleEmpty } from "@react95/icons";

// Import the Windows 95 font is already done in App.tsx

export default function LandingPage() {
  const [, navigate] = useLocation();
  const { setTheme } = useTheme();

  // Force Win95 theme when on landing page
  useEffect(() => {
    setTheme("w95");
  }, [setTheme]);

  // Determine login/dashboard path
  const isAuthenticated = false; // Replace with your auth logic
  const getStartedPath = isAuthenticated ? "/dashboard" : "/login";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 pb-20 overflow-hidden bg-black">
      {/* Desktop-like container */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        
        {/* Welcome Window */}
        <div className="bg-bg border border-border-dark shadow-lg m-4">
          <div className="bg-primary text-primary-contrast px-2 py-1 flex justify-between items-center">
            <span>Welcome.exe</span>
            <button className="bg-bg text-fg px-1 text-xs">×</button>
          </div>
          <div className="px-2 py-1 space-x-2 bg-bg border-t border-border-light">
            <button className="bg-bg border border-border-dark px-2 py-1 text-sm">Submit</button>
            <button className="bg-bg border border-border-dark px-2 py-1 text-sm">Cancel</button>
          </div>
          <div className="p-4 bg-bg text-fg border border-border-dark m-1">
            <div className="flex flex-col space-y-4">
              <h1 className="text-lg mb-4 font-bold">FuckTyping Voice Forms</h1>
              <p className="mb-4">
                Welcome to the next generation of form filling. Say goodbye to typing and hello to talking.
              </p>
              <div className="flex items-center space-x-2 mb-2">
                <FolderExe variant="32x32_4" />
                <span>Voice-enabled forms that save time and increase completion rates.</span>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <Folder variant="32x32_4" />
                <span>AI-powered analysis of spoken responses.</span>
              </div>
              <div className="flex items-center space-x-2">
                <Computer variant="32x32_4" />
                <span>Works on all modern browsers.</span>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-400">
                <p className="text-sm mb-2">Click Submit to continue or Cancel to exit.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Features Window */}
        <div className="bg-bg border border-border-dark shadow-lg">
          <div className="bg-primary text-primary-contrast px-2 py-1 flex justify-between items-center">
            <span>Features.exe</span>
            <button className="bg-bg text-fg px-1 text-xs">×</button>
          </div>
          <div className="px-2 py-1 space-x-2 bg-bg border-t border-border-light">
            <button className="bg-bg border border-border-dark px-2 py-1 text-sm">File</button>
            <button className="bg-bg border border-border-dark px-2 py-1 text-sm">Edit</button>
            <button className="bg-bg border border-border-dark px-2 py-1 text-sm">Help</button>
          </div>
          <div className="p-4 bg-bg text-fg border border-border-dark m-1">
            <h2 className="text-lg mb-3 font-bold">Why Voice Forms?</h2>
            <ul className="mb-4">
              <li className="mb-2">
                <div className="flex items-center">
                  <User variant="32x32_4" className="mr-2" />
                  <span>3x faster than typing on mobile</span>
                </div>
              </li>
              <li className="mb-2">
                <div className="flex items-center">
                  <User variant="32x32_4" className="mr-2" />
                  <span>78% higher completion rates</span>
                </div>
              </li>
              <li className="mb-2">
                <div className="flex items-center">
                  <Mail variant="32x32_4" className="mr-2" />
                  <span>Richer, more detailed responses</span>
                </div>
              </li>
              <li className="mb-2">
                <div className="flex items-center">
                  <Folder variant="32x32_4" className="mr-2" />
                  <span>AI-powered insights and analysis</span>
                </div>
              </li>
            </ul>
            <hr className="my-4" />
            <div className="flex justify-center mt-2">
              <button 
                onClick={() => navigate("/forms/new")}
                className="bg-bg border border-border-dark px-4 py-1 text-sm"
              >
                Create Your First Voice Form
              </button>
            </div>
          </div>
        </div>
        
        {/* Error Message Window - for fun */}
        <div className="bg-bg border border-border-dark shadow-lg w-full md:col-span-2">
          <div className="bg-primary text-primary-contrast px-2 py-1 flex justify-between items-center">
            <span>Traditional Forms Error</span>
            <button className="bg-bg text-fg px-1 text-xs">×</button>
          </div>
          <div className="p-6 bg-bg text-fg border border-border-dark m-1">
            <div className="flex items-start">
              <div className="mr-4">
                <RecycleEmpty variant="32x32_4" />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Fatal Form Error</h3>
                <p className="mb-4">Your users are experiencing form fatigue and abandoning your traditional forms at an alarming rate.</p>
                <p className="mb-4">60-80% of users abandon traditional forms before completion, resulting in lost data and revenue.</p>
                <div className="flex justify-end space-x-2 mt-6">
                  <button 
                    onClick={() => navigate(getStartedPath)} 
                    className="bg-bg border border-border-dark px-4 py-1 text-sm"
                  >
                    Try Voice Forms Instead
                  </button>
                  <button className="bg-bg border border-border-dark px-4 py-1 text-sm">
                    Ignore (Not Recommended)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Demo Window */}
        <div className="bg-bg border border-border-dark shadow-lg w-full md:col-span-2">
          <div className="bg-primary text-primary-contrast px-2 py-1 flex justify-between items-center">
            <span>VoiceDemo.exe</span>
            <button className="bg-bg text-fg px-1 text-xs">×</button>
          </div>
          <div className="px-2 py-1 space-x-2 bg-bg border-t border-border-light">
            <button className="bg-bg border border-border-dark px-2 py-1 text-sm">Record</button>
            <button className="bg-bg border border-border-dark px-2 py-1 text-sm">Stop</button>
            <button className="bg-bg border border-border-dark px-2 py-1 text-sm">Play</button>
          </div>
          <div className="p-4 bg-bg text-fg border border-border-dark m-1">
            <div className="text-center p-4">
              <h3 className="text-lg font-bold mb-3">Try Voice Recording Demo</h3>
              <p className="mb-4">Experience how easy it is to fill forms with just your voice!</p>
              <div className="w-full bg-gray-200 h-20 mb-4 flex items-center justify-center border-2 border-gray-400 border-dashed">
                [Waveform visualization would appear here]
              </div>
              <div className="flex justify-center space-x-4 mt-6">
                <button 
                  onClick={() => navigate("/webrtc-audio-test")} 
                  className="bg-bg border border-border-dark px-4 py-1 text-sm"
                >
                  Launch Demo
                </button>
                <button 
                  onClick={() => navigate("/forms/new")} 
                  className="bg-bg border border-border-dark px-4 py-1 text-sm"
                >
                  Create Your Form
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer with taskbar-like appearance */}
      <div className="fixed bottom-0 left-0 right-0 bg-primary text-primary-contrast border-t-2 border-border-light p-4 flex justify-between z-50 shadow-lg">
        <button className="bg-bg border-2 border-border-dark px-4 py-1 text-sm flex items-center font-bold">
          <span className="mr-2">Start</span>
          <img src="/windows-logo.png" alt="Start" className="w-4 h-4" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        </button>
        <div className="flex items-center space-x-2 text-xs">
          <span>© {new Date().getFullYear()} FuckTyping</span>
          <span>|</span>
          <span>4:20 PM</span>
        </div>
      </div>
    </main>
  );
}
