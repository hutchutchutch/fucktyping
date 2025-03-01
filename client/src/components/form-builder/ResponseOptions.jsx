// src/components/form-builder/ResponseOptions.jsx
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const ResponseOptions = () => {
  const [settings, setSettings] = useState({
    collectEmails: true,
    limitResponses: false,
    responseLimit: 100,
    notifyOnSubmission: true,
    allowMultipleResponses: false,
    showProgressBar: true,
    shuffleQuestions: false,
    dataRetention: "30days",
    confirmationMessage: "Thank you for completing the form!",
  });
  
  const handleSettingChange = (key, value) => {
    setSettings({
      ...settings,
      [key]: value,
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Response Collection</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="collect-emails" className="block">Collect email addresses</Label>
              <p className="text-sm text-muted-foreground">Require respondents to sign in with email</p>
            </div>
            <Switch
              id="collect-emails"
              checked={settings.collectEmails}
              onCheckedChange={(checked) => handleSettingChange("collectEmails", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="limit-responses" className="block">Limit number of responses</Label>
              <p className="text-sm text-muted-foreground">Close form after reaching limit</p>
            </div>
            <Switch
              id="limit-responses"
              checked={settings.limitResponses}
              onCheckedChange={(checked) => handleSettingChange("limitResponses", checked)}
            />
          </div>
          
          {settings.limitResponses && (
            <div className="ml-6 mt-2">
              <Label htmlFor="response-limit" className="text-sm">Response limit</Label>
              <Input
                id="response-limit"
                type="number"
                min="1"
                className="w-32 mt-1"
                value={settings.responseLimit}
                onChange={(e) => handleSettingChange("responseLimit", parseInt(e.target.value) || 100)}
              />
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notify-submission" className="block">Email notification</Label>
              <p className="text-sm text-muted-foreground">Get notified when someone submits a response</p>
            </div>
            <Switch
              id="notify-submission"
              checked={settings.notifyOnSubmission}
              onCheckedChange={(checked) => handleSettingChange("notifyOnSubmission", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="multiple-responses" className="block">Allow multiple responses</Label>
              <p className="text-sm text-muted-foreground">Let people submit more than one response</p>
            </div>
            <Switch
              id="multiple-responses"
              checked={settings.allowMultipleResponses}
              onCheckedChange={(checked) => handleSettingChange("allowMultipleResponses", checked)}
            />
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Form Presentation</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-progress" className="block">Show progress bar</Label>
              <p className="text-sm text-muted-foreground">Display progress through the form</p>
            </div>
            <Switch
              id="show-progress"
              checked={settings.showProgressBar}
              onCheckedChange={(checked) => handleSettingChange("showProgressBar", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="shuffle-questions" className="block">Shuffle question order</Label>
              <p className="text-sm text-muted-foreground">Present questions in random order</p>
            </div>
            <Switch
              id="shuffle-questions"
              checked={settings.shuffleQuestions}
              onCheckedChange={(checked) => handleSettingChange("shuffleQuestions", checked)}
            />
          </div>
          
          <div className="space-y-1">
            <Label htmlFor="confirmation-message" className="block">Confirmation Message</Label>
            <p className="text-sm text-muted-foreground">Shown after form submission</p>
            <Input
              id="confirmation-message"
              value={settings.confirmationMessage}
              onChange={(e) => handleSettingChange("confirmationMessage", e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Data & Privacy</h3>
        
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="data-retention" className="block">Data Retention Period</Label>
            <p className="text-sm text-muted-foreground">How long to keep response data</p>
            <Select
              value={settings.dataRetention}
              onValueChange={(value) => handleSettingChange("dataRetention", value)}
            >
              <SelectTrigger id="data-retention">
                <SelectValue placeholder="Select retention period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30days">30 days</SelectItem>
                <SelectItem value="90days">90 days</SelectItem>
                <SelectItem value="1year">1 year</SelectItem>
                <SelectItem value="forever">Indefinitely</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label className="block">Privacy Settings</Label>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <Checkbox id="privacy-1" className="mt-1" />
                <div>
                  <Label htmlFor="privacy-1" className="text-sm font-normal">Include privacy policy link</Label>
                  <p className="text-xs text-muted-foreground">Adds a link to your privacy policy at the bottom of the form</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox id="privacy-2" className="mt-1" />
                <div>
                  <Label htmlFor="privacy-2" className="text-sm font-normal">Anonymize responses</Label>
                  <p className="text-xs text-muted-foreground">Strip identifying information from responses</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox id="privacy-3" className="mt-1" />
                <div>
                  <Label htmlFor="privacy-3" className="text-sm font-normal">GDPR compliance mode</Label>
                  <p className="text-xs text-muted-foreground">Add consent checkboxes and data processing information</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponseOptions;