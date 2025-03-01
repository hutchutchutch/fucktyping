import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface EmailTemplateEditorProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  recipients: string;
  onRecipientsChange: (recipients: string) => void;
  subject: string;
  onSubjectChange: (subject: string) => void;
  template: string;
  onTemplateChange: (template: string) => void;
}

export default function EmailTemplateEditor({
  enabled,
  onEnabledChange,
  recipients,
  onRecipientsChange,
  subject,
  onSubjectChange,
  template,
  onTemplateChange,
}: EmailTemplateEditorProps) {
  const defaultTemplate = `Hi there,

A new form has been submitted.

Form: {{formName}}
Respondent: {{respondentName}} ({{respondentEmail}})
Date: {{submissionDate}}

View the full response: {{responseLink}}

Thanks,
Voice Form Agent`;

  const handleTemplateChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onTemplateChange(e.target.value);
  };

  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onRecipientsChange(e.target.value);
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSubjectChange(e.target.value);
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md mb-4">
      <div className="mb-3">
        <div className="flex items-center">
          <Switch
            id="send-notifications"
            checked={enabled}
            onCheckedChange={onEnabledChange}
          />
          <Label htmlFor="send-notifications" className="ml-2">
            Send email when form is completed
          </Label>
        </div>
      </div>

      {enabled && (
        <>
          <div className="mb-3">
            <Label htmlFor="email-recipients" className="block text-sm font-medium text-gray-700">
              Recipients (comma separated)
            </Label>
            <Input
              id="email-recipients"
              value={recipients}
              onChange={handleRecipientChange}
              className="mt-1 block w-full"
              placeholder="email1@example.com, email2@example.com"
            />
          </div>

          <div className="mb-3">
            <Label htmlFor="email-subject" className="block text-sm font-medium text-gray-700">
              Email Subject
            </Label>
            <Input
              id="email-subject"
              value={subject}
              onChange={handleSubjectChange}
              className="mt-1 block w-full"
              placeholder="New Form Submission"
            />
          </div>

          <div>
            <Label htmlFor="email-template" className="block text-sm font-medium text-gray-700">
              Email Template
            </Label>
            <Textarea
              id="email-template"
              value={template || defaultTemplate}
              onChange={handleTemplateChange}
              rows={6}
              className="mt-1 block w-full"
              placeholder={defaultTemplate}
            />
            <p className="mt-1 text-xs text-gray-500">
              Available variables: {{formName}}, {{respondentName}}, {{respondentEmail}}, 
              {{submissionDate}}, {{responseLink}}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
