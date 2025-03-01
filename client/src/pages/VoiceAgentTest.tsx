import React, { useState } from 'react';
import VoiceAgentInteraction from '@/components/voice-agent/VoiceAgentInteraction';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormWithQuestions } from '@shared/schema';

export default function VoiceAgentTest() {
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const [forms, setForms] = useState<FormWithQuestions[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch available forms
  const fetchForms = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch('/api/forms');
      
      if (!response.ok) {
        throw new Error('Failed to fetch forms');
      }
      
      const data = await response.json();
      setForms(data);
    } catch (err) {
      console.error('Error fetching forms:', err);
      setError('Failed to load forms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load forms when component mounts
  React.useEffect(() => {
    fetchForms();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Voice Agent Test</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Select a Form</CardTitle>
          <CardDescription>Choose a form to test its voice agent</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading forms...</p>
          ) : error ? (
            <div>
              <p className="text-red-500">{error}</p>
              <Button onClick={fetchForms} className="mt-2">Retry</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Select onValueChange={(value) => setSelectedFormId(Number(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a form" />
                </SelectTrigger>
                <SelectContent>
                  {forms.map(form => (
                    <SelectItem key={form.id} value={form.id.toString()}>
                      {form.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedFormId && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Voice Interaction</h2>
          <VoiceAgentInteraction 
            formId={selectedFormId}
            title={forms.find(f => f.id === selectedFormId)?.title || "Voice Form"}
            description={forms.find(f => f.id === selectedFormId)?.description || "Interact with this form using your voice."}
          />
        </div>
      )}
    </div>
  );
}