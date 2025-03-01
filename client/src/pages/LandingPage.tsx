import { useLocation, Link } from "wouter";
import { Button } from "../components/ui/button";
import { useAuthContext } from "../context/AuthContext";

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
  
  // Use the more complete design from the JSX version
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 py-8 sm:py-16 md:py-20 lg:py-32 max-w-2xl">
            <div className="text-center sm:text-left">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Voice-Driven</span>
                <span className="block text-primary-600">Form Solutions</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl">
                Create, share, and analyze forms with powerful voice-interaction capabilities.
                Enhance your data collection with AI-powered conversation flows.
              </p>
              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center sm:justify-start">
                <Link href={getStartedPath}>
                  <Button size="lg" className="px-8 py-6 text-lg">
                    Get Started
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="hidden lg:block absolute right-0 top-1/2 transform -translate-y-1/2 w-1/2">
          <svg
            className="text-primary-100"
            fill="currentColor"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M46.5,-78.8C59.3,-70.9,68.5,-57.2,74.9,-42.5C81.3,-27.8,85,-12.1,83.2,2.9C81.5,17.9,74.3,32.3,64.5,44.3C54.7,56.3,42.3,65.9,28.3,72.3C14.3,78.6,-1.3,81.7,-15.9,78.2C-30.5,74.7,-44,64.5,-54.3,52.4C-64.6,40.2,-71.6,25.9,-76.2,10.1C-80.8,-5.8,-82.8,-23.2,-76,-35.9C-69.3,-48.6,-53.8,-56.6,-39,-65.4C-24.1,-74.2,-9.9,-83.9,4.4,-86.7C18.6,-89.5,33.6,-86.6,46.5,-78.8Z"
              transform="translate(100 100)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="max-w-lg">
              <svg 
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-full h-auto text-primary-500 opacity-20"
              >
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" x2="12" y1="19" y2="22"/>
                <line x1="8" x2="16" y1="22" y2="22"/>
              </svg>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
              Features
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              A better way to collect data
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our voice-enabled forms make data collection faster, more accessible, and more engaging.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h3 className="mt-5 text-lg font-medium text-gray-900">Voice-Driven Interaction</h3>
                <p className="mt-2 text-base text-gray-500">
                  Natural conversation flow makes form completion easier and more accessible than ever before.
                </p>
              </div>

              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12m6.894 5.785l-1.149-.964M6.256 7.178l-1.15-.964m15.352 8.864l-1.41-.513M4.954 9.435l-1.41-.514M12.002 12l-3.75 6.495" />
                  </svg>
                </div>
                <h3 className="mt-5 text-lg font-medium text-gray-900">AI-Powered Analysis</h3>
                <p className="mt-2 text-base text-gray-500">
                  Get actionable insights from responses with sentiment analysis and automated summarization.
                </p>
              </div>

              <div className="p-6 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </div>
                <h3 className="mt-5 text-lg font-medium text-gray-900">Comprehensive Dashboard</h3>
                <p className="mt-2 text-base text-gray-500">
                  Track form performance, response rates, and analytics in a single, intuitive interface.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">
              How It Works
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Simple, powerful, and flexible
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <span className="text-lg font-bold">1</span>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-gray-900">Create Your Form</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Design your voice-enabled form with our intuitive builder. Add questions, set response types, and customize settings.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <span className="text-lg font-bold">2</span>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-gray-900">Share with Respondents</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Distribute your form through a simple link. Respondents can complete it using voice, text, or both.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-500 text-white">
                  <span className="text-lg font-bold">3</span>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg font-medium text-gray-900">Analyze Results</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Review responses, analyze trends, and export data. AI processing helps you extract key insights.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to transform</span>
            <span className="block">your data collection?</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-primary-200">
            Start creating voice-enabled forms today and experience the difference.
          </p>
          <Link href={getStartedPath}>
            <Button
              size="lg"
              className="mt-8 px-8 py-6 text-lg bg-white text-primary-600 hover:bg-primary-50"
            >
              Get started for free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="text-center text-base text-gray-400">
            &copy; {new Date().getFullYear()} Voice Form Agent, Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}