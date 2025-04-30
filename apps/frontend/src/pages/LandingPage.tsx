import React from 'react';
import { Link } from 'wouter';
import { Button } from '@ui/button';
import { ArrowRight, Mic, Save, BarChart3, Clock } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-50 to-sky-100 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-60 -left-20 w-60 h-60 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
        
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Left side: Content */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
                  <span className="text-indigo-600">Fuck</span> Typing.<br />
                  <span className="text-2xl md:text-3xl font-medium text-slate-700">
                    Voice-First Form Conversations
                  </span>
                </h1>
                
                <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0">
                  Transform tedious form-filling into natural conversations. 
                  Our voice-based platform helps you build and respond to forms with just your voice.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link href="/dashboard">
                    <Button size="lg" className="gap-2">
                      Try Demo Dashboard
                      <ArrowRight size={16} />
                    </Button>
                  </Link>
                  <Link href="/forms">
                    <Button variant="outline" size="lg">
                      View Example Forms
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Right side: Image/Illustration */}
              <div className="flex-1 relative">
                <div className="relative mx-auto w-full max-w-md">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg transform -rotate-3 scale-105 opacity-10"></div>
                  <div className="relative bg-white p-6 rounded-lg shadow-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="text-xs font-medium text-slate-500">Voice Form Assistant</div>
                    </div>
                    
                    <div className="bg-slate-50 p-4 rounded-md mb-4 border border-slate-200">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 flex-shrink-0">
                          <Mic size={16} />
                        </div>
                        <div>
                          <p className="text-sm text-slate-700 mb-1">Hello! I'll help you fill out this form. What's your name?</p>
                          <div className="bg-indigo-50 px-3 py-1.5 rounded-full inline-block text-xs text-indigo-700 font-medium">Listening...</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-md border border-indigo-200">
                      <p className="text-sm text-indigo-900 font-medium">Complete forms 3x faster with voice</p>
                      <div className="flex mt-2 gap-2">
                        <div className="bg-white p-2 rounded flex-1 shadow-sm flex items-center justify-center">
                          <div className="w-full h-2 bg-indigo-200 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full" style={{width: '80%'}}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">Why Voice-First Forms?</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg mb-4 flex items-center justify-center text-indigo-600">
                <Clock size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">3x Faster Completion</h3>
              <p className="text-slate-600">
                Speaking is 3x faster than typing. Complete forms in a fraction of the time with natural conversation.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg mb-4 flex items-center justify-center text-indigo-600">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">Higher Completion Rates</h3>
              <p className="text-slate-600">
                Users are 70% more likely to complete a voice form than a traditional text form.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg mb-4 flex items-center justify-center text-indigo-600">
                <Save size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900">AI-Powered Forms</h3>
              <p className="text-slate-600">
                Our LangGraph technology creates dynamic conversational flows for truly intelligent form interactions.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-indigo-800 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to transform your forms?</h2>
          <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who've switched to voice-first form experiences.
          </p>
          <Link href="/dashboard">
            <Button size="lg" variant="secondary" className="gap-2">
              Get Started Now
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;