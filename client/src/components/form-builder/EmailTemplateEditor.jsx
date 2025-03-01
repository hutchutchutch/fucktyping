import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Card from "../common/Card";

function EmailTemplateEditor({ 
  emailSubject = "", 
  emailRecipients = "", 
  emailTemplate = "",
  onUpdate
}) {
  // Default template if empty
  const defaultTemplate = `A new response has been submitted to your form.

{formName}
Submitted by: {respondent}
Date: {submissionDate}

View the full response on your dashboard.`;

  return (
    <Card className="mb-6">
      <Card.Header>
        <Card.Title>Email Template</Card.Title>
      </Card.Header>
      <Card.Content>
        <div className="space-y-4">
          <div>
            <Label htmlFor="emailSubject" className="mb-1">Email Subject</Label>
            <Input 
              type="text" 
              id="emailSubject" 
              value={emailSubject} 
              onChange={(e) => onUpdate('emailSubject', e.target.value)}
              placeholder="New form response received"
            />
          </div>
          
          <div>
            <Label htmlFor="emailRecipients" className="mb-1">Recipients</Label>
            <Input 
              type="text" 
              id="emailRecipients" 
              value={emailRecipients} 
              onChange={(e) => onUpdate('emailRecipients', e.target.value)}
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
              rows="4" 
              value={emailTemplate || defaultTemplate}
              onChange={(e) => onUpdate('emailTemplate', e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Available variables: {'{formName}'}, {'{respondent}'}, {'{submissionDate}'}, {'{responseLink}'}
            </p>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
}

export default EmailTemplateEditor;
