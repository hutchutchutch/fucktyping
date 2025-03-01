import React, { useState } from "react";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";
import FormBuilderComponent from "@/components/form-builder/FormBuilder";
import EmailTemplateEditor from "@/components/form-builder/EmailTemplateEditor";
// @ts-ignore - Using JSX component without type definitions
import ResponseOptions from "@/components/form-builder/ResponseOptions";

export default function FormBuilder() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("builder");
  const [formName, setFormName] = useState(id ? "Edit Form" : "Untitled Form");
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
          <div className="pb-5 border-b mb-6 flex justify-between items-center">
            {isEditing ? (
              <div className="flex items-center">
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="text-2xl font-bold bg-transparent border-b border-primary px-1 focus:outline-none"
                  autoFocus
                />
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="ml-2">
                  Save
                </Button>
              </div>
            ) : (
              <h2 className="text-2xl font-bold flex items-center">
                {formName}
                <button
                  onClick={() => setIsEditing(true)}
                  className="ml-2 text-muted-foreground hover:text-foreground"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </h2>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="mb-2">
              <TabsTrigger value="builder">Build Form</TabsTrigger>
              <TabsTrigger value="settings">Response Settings</TabsTrigger>
              <TabsTrigger value="emails">Email Notifications</TabsTrigger>
              <TabsTrigger value="share">Share</TabsTrigger>
            </TabsList>

            <TabsContent value="builder" className="space-y-6">
              <div className="bg-card shadow rounded-lg overflow-hidden p-6">
                <FormBuilderComponent />
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <div className="bg-card shadow rounded-lg overflow-hidden p-6">
                <ResponseOptions />
              </div>
            </TabsContent>

            <TabsContent value="emails" className="space-y-6">
              <div className="bg-card shadow rounded-lg overflow-hidden">
                <EmailTemplateEditor />
              </div>
            </TabsContent>

            <TabsContent value="share" className="space-y-6">
              <div className="bg-card shadow rounded-lg overflow-hidden p-6">
                <h2 className="text-2xl font-bold mb-6">Share Your Form</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Form Link</h3>
                    <div className="flex">
                      <input
                        type="text"
                        value="https://voiceformgenie.com/form/abc123"
                        readOnly
                        className="w-full p-2 border rounded-l-md bg-muted/30"
                      />
                      <Button className="rounded-l-none">Copy</Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">QR Code</h3>
                    <div className="flex items-center justify-between">
                      <div className="border p-4 rounded-md bg-white">
                        <div className="w-32 h-32 bg-muted/30 flex items-center justify-center">
                          QR Code Placeholder
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Button className="w-full">Download PNG</Button>
                        <Button variant="outline" className="w-full">Download SVG</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
      
      <MobileNav />
    </div>
  );
}
