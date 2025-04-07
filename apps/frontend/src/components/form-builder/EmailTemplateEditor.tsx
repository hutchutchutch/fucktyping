import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/tabs";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Textarea } from "@ui/textarea";
import { Label } from "@ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@ui/card";

interface EmailTemplateEditorProps {
  emailSubject?: string;
  emailRecipients?: string;
  emailTemplate?: string;
  onUpdate?: (field: string, value: string) => void;
}

const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({ 
  emailSubject = "", 
  emailRecipients = "", 
  emailTemplate = "",
  onUpdate
}) => {
  // If using standalone mode (without onUpdate function)
  const [subject, setSubject] = useState<string>("Your form response has been received");
  const [confirmationBody, setConfirmationBody] = useState<string>(
    "Thank you for completing our form. We have received your responses and will process them shortly."
  );
  const [notificationBody, setNotificationBody] = useState<string>(
    "A new response has been submitted to your form. View the response in your dashboard."
  );

  // Default template if empty
  const defaultTemplate = `A new response has been submitted to your form.

{formName}
Submitted by: {respondent}
Date: {submissionDate}

View the full response on your dashboard.`;

  // Mock variables for preview
  const mockRespondent = "John Doe";
  const mockFormTitle = "Customer Feedback Survey";
  const mockDate = new Date().toLocaleDateString();

  // Handling changes based on whether we're used standalone or with a parent controller
  const handleSubjectChange = (value: string) => {
    if (onUpdate) {
      onUpdate('emailSubject', value);
    } else {
      setSubject(value);
    }
  };

  const handleRecipientsChange = (value: string) => {
    if (onUpdate) {
      onUpdate('emailRecipients', value);
    }
  };

  const handleTemplateChange = (value: string) => {
    if (onUpdate) {
      onUpdate('emailTemplate', value);
    } else {
      setNotificationBody(value);
    }
  };

  // Determine if we're in standalone or controlled mode
  const isControlled = !!onUpdate;

  // If controlled, use simple template
  if (isControlled) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Email Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="emailSubject" className="mb-1">Email Subject</Label>
              <Input 
                type="text" 
                id="emailSubject" 
                value={emailSubject} 
                onChange={(e) => handleSubjectChange(e.target.value)}
                placeholder="New form response received"
              />
            </div>
            
            <div>
              <Label htmlFor="emailRecipients" className="mb-1">Recipients</Label>
              <Input 
                type="text" 
                id="emailRecipients" 
                value={emailRecipients} 
                onChange={(e) => handleRecipientsChange(e.target.value)}
                placeholder="email@example.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple email addresses with commas
              </p>
            </div>
            
            <div>
              <Label htmlFor="emailTemplate" className="mb-1">Email Body</Label>
              <Textarea 
                id="emailTemplate" 
                rows={4} 
                value={emailTemplate || defaultTemplate}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Available variables: {'{formName}'}, {'{respondent}'}, {'{submissionDate}'}, {'{responseLink}'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Standalone version with tabs for multiple templates
  return (
    <div className="bg-card p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Email Notifications</h2>
      <p className="text-muted-foreground mb-6">
        Configure the emails that will be sent when a form is submitted
      </p>

      <Tabs defaultValue="confirmation">
        <TabsList className="mb-4">
          <TabsTrigger value="confirmation">Confirmation Email</TabsTrigger>
          <TabsTrigger value="notification">Admin Notification</TabsTrigger>
        </TabsList>

        <TabsContent value="confirmation">
          <div className="space-y-4">
            <div>
              <Label htmlFor="confirmation-subject" className="mb-1">Email Subject</Label>
              <Input 
                id="confirmation-subject"
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="confirmation-body" className="mb-1">Email Body</Label>
              <Textarea 
                id="confirmation-body"
                className="h-40"
                value={confirmationBody}
                onChange={(e) => setConfirmationBody(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                You can use the following variables: {'{respondent}'}, {'{formTitle}'}, {'{date}'}, {'{responseLink}'}
              </p>
            </div>

            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium mb-2">Preview</h3>
              <div className="bg-muted/30 p-4 rounded-md">
                <div className="mb-2">
                  <span className="font-medium">Subject:</span> {subject}
                </div>
                <div>
                  <span className="font-medium">Body:</span><br />
                  <p className="mt-1 whitespace-pre-line">
                    {confirmationBody
                      .replace("{respondent}", mockRespondent)
                      .replace("{formTitle}", mockFormTitle)
                      .replace("{date}", mockDate)
                      .replace("{responseLink}", "https://example.com/view/123")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notification">
          <div className="space-y-4">
            <div>
              <Label htmlFor="admin-email" className="mb-1">Admin Email Address</Label>
              <Input 
                id="admin-email"
                type="email" 
                placeholder="Enter email address"
              />
            </div>
            
            <div>
              <Label htmlFor="notification-subject" className="mb-1">Email Subject</Label>
              <Input 
                id="notification-subject"
                type="text" 
                value="New form submission received"
                readOnly
              />
            </div>
            
            <div>
              <Label htmlFor="notification-body" className="mb-1">Email Body</Label>
              <Textarea 
                id="notification-body"
                className="h-40"
                value={notificationBody}
                onChange={(e) => setNotificationBody(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                You can use the following variables: {'{respondent}'}, {'{formTitle}'}, {'{date}'}, {'{responseLink}'}
              </p>
            </div>

            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium mb-2">Preview</h3>
              <div className="bg-muted/30 p-4 rounded-md">
                <div className="mb-2">
                  <span className="font-medium">Subject:</span> New form submission received
                </div>
                <div>
                  <span className="font-medium">Body:</span><br />
                  <p className="mt-1 whitespace-pre-line">
                    {notificationBody
                      .replace("{respondent}", mockRespondent)
                      .replace("{formTitle}", mockFormTitle)
                      .replace("{date}", mockDate)
                      .replace("{responseLink}", "https://example.com/view/123")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button>Save Email Templates</Button>
      </div>
    </div>
  );
};

export default EmailTemplateEditor;