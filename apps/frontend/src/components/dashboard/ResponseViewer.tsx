import { useState } from "react";
import { useResponses } from "@hooks/useResponses";
import Card from "@components/common/Card";
import Button from "@components/common/Button";
import { Badge } from "@ui/badge";
import { Skeleton } from "@ui/skeleton";
import { ArrowLeft, Download, MailIcon, Share2 } from "lucide-react";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";

export interface Answer {
  id: string;
  questionText: string;
  questionType: 'rating' | 'yesno' | string;
  value: string;
  audioUrl?: string;
  duration?: string;
}

export interface Response {
  formTitle: string;
  submittedBy?: string;
  submittedAt: string;
  completionTime?: number;
  device?: string;
  ipAddress?: string;
  sentimentScore?: number;
  keyTopics?: string[];
  aiSummary?: string;
  answers?: Answer[];
  audioProgress?: number;
  audioTime?: string;
}

interface ResponseViewerProps {
  formId: string;
  responseId: string;
}

function ResponseViewer({ formId, responseId }: ResponseViewerProps) {
  const { 
    response, 
    isLoading, 
    sendEmail, 
    downloadResponse,
    playAudio,
    isPlaying,
    currentAudioId
  } = useResponses(formId, responseId);
  
  const [sentimentColors] = useState({
    positive: 'bg-green-500',
    neutral: 'bg-blue-500',
    negative: 'bg-red-500'
  });

  if (isLoading) {
    return (
      <div>
        <div className="mb-6 flex items-center">
          <Skeleton className="h-8 w-8 rounded-full mr-2" />
          <Skeleton className="h-8 w-48" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <Card.Content>
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="space-y-6">
                  {[1, 2, 3].map(i => (
                    <div key={i}>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-6 w-full mb-1" />
                      <Skeleton className="h-20 w-full rounded" />
                    </div>
                  ))}
                </div>
              </Card.Content>
            </Card>
          </div>
          
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <Card.Content>
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i}>
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  ))}
                </div>
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Response Not Found</h2>
        <p className="text-gray-600 mb-6">The response you're looking for might have been deleted or doesn't exist.</p>
        <Link href="/dashboard">
          <Button>Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const handlePlayAudio = (answerId: string, audioUrl: string) => {
    playAudio(answerId, audioUrl);
  };

  const getProgressWidth = (audioProgress: number) => {
    return `${audioProgress * 100}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const sentimentToLabel = (score: number | undefined) => {
    if (!score) return "Neutral";
    if (score > 70) return "Positive";
    if (score < 30) return "Negative";
    return "Neutral";
  };

  const sentimentToColor = (score: number | undefined) => {
    if (!score) return sentimentColors.neutral;
    if (score > 70) return sentimentColors.positive;
    if (score < 30) return sentimentColors.negative;
    return sentimentColors.neutral;
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <Link href={`/forms/${formId}/responses`}>
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Response Details</h1>
        </div>
        <p className="text-gray-600">{response.formTitle} - Submission #{responseId}</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <Card.Header>
              <Card.Title>Response Summary</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-6">
                {response.answers && response.answers.map((answer: Answer, index: number) => (
                  <div key={answer.id || index}>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Question {index + 1}</h3>
                    <p className="font-medium mb-1">{answer.questionText}</p>
                    
                    {answer.questionType === 'rating' && (
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-medium mr-3">
                          {answer.value}
                        </div>
                        <span className="text-gray-700">
                          {parseInt(answer.value) >= 4 ? "Good" : parseInt(answer.value) <= 2 ? "Poor" : "Average"}
                        </span>
                      </div>
                    )}
                    
                    {answer.questionType === 'yesno' && (
                      <div className={`px-3 py-1 ${
                        answer.value.toLowerCase() === 'yes' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      } rounded inline-block`}>
                        {answer.value}
                      </div>
                    )}
                    
                    {(answer.questionType !== 'rating' && answer.questionType !== 'yesno') && (
                      <p className="text-gray-700 p-3 bg-gray-50 rounded">{answer.value}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
          
          <Card>
            <Card.Header>
              <Card.Title>Voice Recordings</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                {response.answers && response.answers.filter((a: Answer) => a.audioUrl).map((answer: Answer, index: number) => (
                  <div key={answer.id || index} className="border rounded-md p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">Question {index + 1} Recording</h3>
                      <span className="text-sm text-gray-500">Duration: {answer.duration || '10s'}</span>
                    </div>
                    
                    <div className="bg-gray-50 h-16 rounded-lg flex items-center justify-center mb-3 relative overflow-hidden">
                      {/* Placeholder for waveform visualization */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex items-end space-x-1 h-10">
                          {Array.from({ length: 50 }).map((_, i) => (
                            <div 
                              key={i}
                              className="w-1 bg-gray-400 rounded-full" 
                              style={{ 
                                height: `${Math.random() * 60 + 20}%`, 
                                opacity: isPlaying && currentAudioId === answer.id ? 0.8 : 0.5 
                              }}
                            ></div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handlePlayAudio(answer.id, answer.audioUrl || '')}
                        className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 focus:outline-none mr-2"
                      >
                        {isPlaying && currentAudioId === answer.id ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        )}
                      </Button>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div 
                            className="bg-gray-500 h-1.5 rounded-full" 
                            style={{ 
                              width: isPlaying && currentAudioId === answer.id 
                                ? getProgressWidth(response.audioProgress || 0) 
                                : "0%" 
                            }}
                          ></div>
                        </div>
                      </div>
                      <span className="ml-2 text-xs text-gray-500">
                        {isPlaying && currentAudioId === answer.id 
                          ? (response.audioTime || "0:00") 
                          : "0:00"} / {answer.duration || "0:10"}
                      </span>
                    </div>
                  </div>
                ))}

                {(!response.answers || !response.answers.some((a: Answer) => a.audioUrl)) && (
                  <div className="text-center py-4 text-gray-500">
                    No voice recordings available for this response
                  </div>
                )}
              </div>
            </Card.Content>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card className="mb-6">
            <Card.Header>
              <Card.Title>Response Information</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Submitted By</h3>
                  <p>{response.submittedBy || "Anonymous User"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Submission Date</h3>
                  <p>{formatDate(response.submittedAt)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Completion Time</h3>
                  <p>{response.completionTime 
                    ? `${Math.floor(response.completionTime / 60)} minutes ${response.completionTime % 60} seconds`
                    : "1 minute 45 seconds"}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Device</h3>
                  <p>{response.device || "Unknown Device"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">IP Address</h3>
                  <p>{response.ipAddress || "192.168.1.xxx"}</p>
                </div>
              </div>
            </Card.Content>
          </Card>
          
          <Card className="mb-6">
            <Card.Header>
              <Card.Title>Actions</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-3">
                <Button 
                  variant="default" 
                  className="w-full" 
                  onClick={() => sendEmail(responseId)}
                >
                  <MailIcon className="h-4 w-4 mr-2" /> Send Email Response
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => downloadResponse(responseId)}
                >
                  <Download className="h-4 w-4 mr-2" /> Download Response
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                >
                  <Share2 className="h-4 w-4 mr-2" /> Share Response
                </Button>
              </div>
            </Card.Content>
          </Card>
          
          <Card>
            <Card.Header>
              <Card.Title>AI Analysis</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Sentiment</h3>
                  <div className="flex items-center mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                      <div 
                        className={`${sentimentToColor(response.sentimentScore)} h-2.5 rounded-full`} 
                        style={{ width: `${response.sentimentScore || 75}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-700">
                      {sentimentToLabel(response.sentimentScore)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Key Topics</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(response.keyTopics || ["Customer Service", "Mobile App", "Performance"]).map((topic: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Summary</h3>
                  <p className="text-sm text-gray-700 mt-1">
                    {response.aiSummary || 
                      "Customer is generally satisfied with the service and specifically mentions positive experiences with customer support. They recommend improving the mobile app's performance."}
                  </p>
                </div>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ResponseViewer;
