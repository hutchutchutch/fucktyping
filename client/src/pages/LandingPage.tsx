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


import { useEffect, useState } from "react";

// Add animations style
const floatingAnimation = `
  @keyframes float {
    0% { transform: translateY(0px) rotate(2deg); }
    50% { transform: translateY(-10px) rotate(1deg); }
    100% { transform: translateY(0px) rotate(2deg); }
  }

  @keyframes autoScroll {
    0% { transform: translateY(0); }
    100% { transform: translateY(-1500px); }
  }

  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  
  .animate-autoScroll {
    animation: autoScroll 45s linear infinite;
  }
`;

export default function LandingPage() {
  const [, navigate] = useLocation();

  // Add the style for floating animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = floatingAnimation;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
      <header className="relative overflow-hidden bg-gradient-to-b from-gray-50 via-white to-transparent text-gray-900 min-h-screen">
        <div className="absolute inset-0 opacity-80 animate-pulse" style={{animationDuration: '10s'}}>
          <DigitalRain color="#4f46e5" opacity={0.3} speed={0.7} density={0.08} fontSize={18} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10 h-[calc(100vh-100px)] flex items-center">
          <div className="flex flex-col lg:flex-row items-center w-full">
            <div className="w-full lg:w-1/2 pr-0 lg:pr-12 mb-10 lg:mb-0">
              <div className="text-left">
                <h2 className="text-5xl sm:text-6xl font-extrabold text-gray-900 mb-2 drop-shadow-sm">Users Hate Forms</h2>
                <h3 className="text-3xl sm:text-4xl font-bold text-indigo-600 mb-4 drop-shadow-sm">Leads Slip Away</h3>
                <h1 className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tight mt-2 mb-10 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 drop-shadow">
                  fuck typing
                </h1>
                <Link href="/forms/new">
                  <Button size="lg" className="px-8 py-6 text-xl font-bold bg-indigo-600 hover:bg-indigo-700 shadow-xl rounded-xl">
                    Create Voice Agent Form <Mic className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="bg-white p-4 rounded-lg shadow-xl transform rotate-2 opacity-85 relative max-h-[450px] overflow-hidden animate-float">
                <div className="absolute -top-3 -right-3">
                  <div className="bg-indigo-500 text-white rounded-full p-2">
                    <X className="h-6 w-6" />
                  </div>
                </div>
                <div className="h-[450px] overflow-hidden relative">
                  <div className="animate-autoScroll absolute w-full">
                  <div className="bg-gray-100 p-3 rounded-t-md sticky top-0 z-10 shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <div className="text-sm text-gray-600 font-medium">Mind-Numbing Form (Page 1/7)</div>
                    </div>
                  </div>
                  <div className="p-4 border-t">
                    <div className="flex flex-col space-y-6">
                      {/* Form sections - Deliberately long and tedious */}
                      <div className="border border-gray-300 p-3 rounded bg-white">
                        <div className="text-lg font-bold border-b pb-2 mb-3">1. Personal Information</div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">What's your government-approved identifier? <span className="text-indigo-500">*</span></label>
                            <input className="border border-gray-300 rounded w-full py-2 px-3" type="text" placeholder="Your typing sucks..." />
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">That name nobody uses but we need anyway</label>
                            <input className="border border-gray-300 rounded w-full py-2 px-3" type="text" placeholder="Nobody cares..." />
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Family name or whatever <span className="text-indigo-500">*</span></label>
                            <input className="border border-gray-300 rounded w-full py-2 px-3" type="text" placeholder="Must match your birth certificate" />
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">What we should call you if we cared</label>
                            <input className="border border-gray-300 rounded w-full py-2 px-3" type="text" placeholder="We'll ignore this anyway" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-gray-700 text-sm font-bold mb-2">How old are you, exactly? <span className="text-indigo-500">*</span></label>
                              <input className="border border-gray-300 rounded w-full py-2 px-3" type="date" placeholder="We need to verify..." />
                            </div>
                            <div>
                              <label className="block text-gray-700 text-sm font-bold mb-2">Select from our limited options <span className="text-indigo-500">*</span></label>
                              <select className="border border-gray-300 rounded w-full py-2 px-3">
                                <option>Pick one already</option>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Non-binary</option>
                                <option>Rather not deal with this</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border border-gray-300 p-3 rounded bg-white">
                        <div className="text-lg font-bold border-b pb-2 mb-3">2. Your Digital Footprint</div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Where we'll spam you forever <span className="text-indigo-500">*</span></label>
                            <input className="border border-gray-300 rounded w-full py-2 px-3" type="email" placeholder="We'll send 5 emails a day" />
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Type it again because we don't trust you <span className="text-indigo-500">*</span></label>
                            <input className="border border-gray-300 rounded w-full py-2 px-3" type="email" placeholder="Make sure it matches!" />
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Number for our telemarketers <span className="text-indigo-500">*</span></label>
                            <input className="border border-gray-300 rounded w-full py-2 px-3" type="tel" placeholder="We call during dinner time" />
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">That landline nobody uses anymore</label>
                            <input className="border border-gray-300 rounded w-full py-2 px-3" type="tel" placeholder="Does anyone still have these?" />
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Number to interrupt you at work</label>
                            <input className="border border-gray-300 rounded w-full py-2 px-3" type="tel" placeholder="For 'urgent' matters only" />
                          </div>
                        </div>
                      </div>

                      <div className="border border-gray-300 p-3 rounded bg-white">
                        <div className="text-lg font-bold border-b pb-2 mb-3">3. Where We'll Find You</div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Tell me where you live <span className="text-indigo-500">*</span></label>
                            <input className="border border-gray-300 rounded w-full py-2 px-3" type="text" placeholder="So we can randomly visit..." />
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Extra details we'll ignore</label>
                            <input className="border border-gray-300 rounded w-full py-2 px-3" type="text" placeholder="Apt 2B or whatever" />
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-gray-700 text-sm font-bold mb-2">City or village or hamlet <span className="text-indigo-500">*</span></label>
                              <input className="border border-gray-300 rounded w-full py-2 px-3" type="text" placeholder="Don't be pretentious" />
                            </div>
                            <div>
                              <label className="block text-gray-700 text-sm font-bold mb-2">Pick a rectangle <span className="text-indigo-500">*</span></label>
                              <select className="border border-gray-300 rounded w-full py-2 px-3">
                                <option>Some arbitrary region</option>
                                <option>AL</option>
                                <option>AK</option>
                                <option>AZ</option>
                                {/* Imagine all 50 states here */}
                              </select>
                            </div>
                            <div>
                              <label className="block text-gray-700 text-sm font-bold mb-2">Magic mail code <span className="text-indigo-500">*</span></label>
                              <input className="border border-gray-300 rounded w-full py-2 px-3" type="text" placeholder="5 random digits" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Where you pledge allegiance <span className="text-indigo-500">*</span></label>
                            <select className="border border-gray-300 rounded w-full py-2 px-3">
                              <option>🇺🇸 Land of the forms</option>
                              <option>🇨🇦 Maple syrup land</option>
                              <option>🇲🇽 Taco Tuesday land</option>
                              {/* Imagine 100+ countries here */}
                            </select>
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">How long until you flee this place?</label>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <select className="border border-gray-300 rounded w-full py-2 px-3">
                                  <option>Too many years</option>
                                  <option>1</option>
                                  <option>2</option>
                                  <option>Way too long</option>
                                </select>
                              </div>
                              <div>
                                <select className="border border-gray-300 rounded w-full py-2 px-3">
                                  <option>Painful months</option>
                                  <option>1</option>
                                  <option>2</option>
                                  <option>3</option>
                                  {/* More months */}
                                </select>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <input type="checkbox" className="mr-2" />
                            <label className="text-gray-700 text-sm">I'm a flight risk (less than 2 years)</label>
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 mt-4 flex items-center">
                        <div className="h-1 bg-gray-300 rounded-full flex-grow mr-2">
                          <div className="h-1 bg-indigo-500 rounded-full" style={{width: '14%'}}></div>
                        </div>
                        <span>Page 1 of 7 (32 fields remaining)</span>
                      </div>

                      <div className="sticky bottom-0 bg-white p-3 border-t border-gray-200 flex justify-between">
                        <button className="px-4 py-2 bg-gray-200 rounded text-gray-600" disabled>Previous</button>
                        <button className="px-4 py-2 bg-indigo-500 text-white rounded">Next Page</button>
                      </div>
                      
                      {/* Additional form sections for continuous scrolling */}
                      <div className="border border-gray-300 p-3 rounded bg-white mt-6">
                        <div className="text-lg font-bold border-b pb-2 mb-3">4. Soul-Crushing Career Details</div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Who owns your life Monday-Friday <span className="text-indigo-500">*</span></label>
                            <input className="border border-gray-300 rounded w-full py-2 px-3" type="text" placeholder="We'll check your LinkedIn" />
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Fancy title that means nothing <span className="text-indigo-500">*</span></label>
                            <input className="border border-gray-300 rounded w-full py-2 px-3" type="text" placeholder="'Specialist' or whatever" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-gray-700 text-sm font-bold mb-2">Prison sentence began <span className="text-indigo-500">*</span></label>
                              <input className="border border-gray-300 rounded w-full py-2 px-3" type="date" placeholder="Day your spirit died" />
                            </div>
                            <div>
                              <label className="block text-gray-700 text-sm font-bold mb-2">How broke are you? <span className="text-indigo-500">*</span></label>
                              <input className="border border-gray-300 rounded w-full py-2 px-3" type="text" placeholder="Lie if you want, we know" />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border border-gray-300 p-3 rounded bg-white mt-6">
                        <div className="text-lg font-bold border-b pb-2 mb-3">5. Overpriced Knowledge Acquisition</div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">How deep in debt are you? <span className="text-indigo-500">*</span></label>
                            <select className="border border-gray-300 rounded w-full py-2 px-3">
                              <option>How bad is it?</option>
                              <option>Got lucky - just high school</option>
                              <option>2 years of regret</option>
                              <option>4 years of pain</option>
                              <option>Extended suffering (Master's)</option>
                              <option>Life ruined (Doctorate)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Overpriced campus name <span className="text-indigo-500">*</span></label>
                            <input className="border border-gray-300 rounded w-full py-2 px-3" type="text" placeholder="Where you wasted your youth" />
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Theoretical knowledge you never use <span className="text-indigo-500">*</span></label>
                            <input className="border border-gray-300 rounded w-full py-2 px-3" type="text" placeholder="Let's pretend it matters" />
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">When they finally released you <span className="text-indigo-500">*</span></label>
                            <input className="border border-gray-300 rounded w-full py-2 px-3" type="number" min="1950" max="2030" placeholder="Year of liberation" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="border border-gray-300 p-3 rounded bg-white mt-6">
                        <div className="text-lg font-bold border-b pb-2 mb-3">6. Where We'll Steal Your Money</div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Pick your poison <span className="text-indigo-500">*</span></label>
                            <select className="border border-gray-300 rounded w-full py-2 px-3">
                              <option>How would you like to be robbed?</option>
                              <option>Empty checking</option>
                              <option>LOL "savings"</option>
                              <option>Future retirement gone</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Which money vault do you use? <span className="text-indigo-500">*</span></label>
                            <input className="border border-gray-300 rounded w-full py-2 px-3" type="text" placeholder="Bank of Giving Us Your Cash" />
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Secret code to your money <span className="text-indigo-500">*</span></label>
                            <input className="border border-gray-300 rounded w-full py-2 px-3" type="text" placeholder="We promise we won't use it!" />
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Magic digits to drain account <span className="text-indigo-500">*</span></label>
                            <input className="border border-gray-300 rounded w-full py-2 px-3" type="text" placeholder="For totally legitimate purposes" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="border border-gray-300 p-3 rounded bg-white mt-6">
                        <div className="text-lg font-bold border-b pb-2 mb-3">7. People Who'll Lie For You</div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Person who'll pretend to know you <span className="text-indigo-500">*</span></label>
                            <input className="border border-gray-300 rounded w-full py-2 px-3" type="text" placeholder="Your most gullible friend" />
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">How they'll fake knowing you <span className="text-indigo-500">*</span></label>
                            <input className="border border-gray-300 rounded w-full py-2 px-3" type="text" placeholder="'Oh yeah, great person!'" />
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Number they'll never answer <span className="text-indigo-500">*</span></label>
                            <input className="border border-gray-300 rounded w-full py-2 px-3" type="tel" placeholder="They'll let it go to voicemail" />
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">Email they'll ignore <span className="text-indigo-500">*</span></label>
                            <input className="border border-gray-300 rounded w-full py-2 px-3" type="email" placeholder="Straight to spam folder" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 mt-4 flex items-center">
                        <div className="h-1 bg-gray-300 rounded-full flex-grow mr-2">
                          <div className="h-1 bg-indigo-500 rounded-full" style={{width: '100%'}}></div>
                        </div>
                        <span>Page 7 of 7 (0 fields remaining)</span>
                      </div>
                      
                      <div className="sticky bottom-0 bg-white p-3 border-t border-gray-200 flex justify-between">
                        <button className="px-4 py-2 bg-gray-200 rounded text-gray-600">Previous</button>
                        <button className="px-4 py-2 bg-green-500 text-white rounded">Submit Application</button>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
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
              <div className="p-1 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Form Fatigue</h3>
                <p className="text-gray-600 mb-6">
                  Users are overwhelmed when forms are too long, leading to high abandonment rates and incomplete data.
                </p>
                <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">
                  Reduced Completion Rates
                </Badge>
              </div>
            </div>

            {/* Pain Point 2 */}
            <div className="bg-gray-50 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
              <div className="p-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <div className="p-6">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <ClipboardCheck className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Missing Context</h3>
                <p className="text-gray-600 mb-6">
                  Businesses miss out on extra details they didn't explicitly ask for, losing valuable insights.
                </p>
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
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
      <footer className="bg-gray-50 text-gray-800 border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center mb-4 md:mb-0">
              <Mic className="h-8 w-8 text-indigo-600 mr-2" />
              <span className="text-xl font-bold">Voice Form Agent</span>
            </div>
            <nav className="flex space-x-6">
              <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Features</a>
              <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Pricing</a>
              <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Documentation</a>
              <a href="#" className="text-gray-600 hover:text-indigo-600 transition-colors">Support</a>
            </nav>
          </div>
          <p className="text-center text-gray-500">
            &copy; {new Date().getFullYear()} Voice Form Agent, Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}