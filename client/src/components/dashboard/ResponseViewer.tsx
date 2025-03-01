import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormWithQuestions, ResponseWithAnswers } from "@shared/schema";

export default function ResponseViewer() {
  const { id } = useParams<{ id: string }>();
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  
  const { data: form, isLoading: formLoading } = useQuery<FormWithQuestions>({
    queryKey: [`/api/forms/${id}`],
    enabled: !!id,
  });
  
  const { data: responses, isLoading: responsesLoading } = useQuery<ResponseWithAnswers[]>({
    queryKey: [`/api/forms/${id}/responses`],
    enabled: !!id,
  });
  
  const isLoading = formLoading || responsesLoading;
  
  // Filter responses based on search term and time filter
  const filteredResponses = responses?.filter((response) => {
    // Search filter
    const searchTermLower = searchTerm.toLowerCase();
    if (searchTerm && !(
      response.respondentName?.toLowerCase().includes(searchTermLower) ||
      response.respondentEmail?.toLowerCase().includes(searchTermLower) ||
      response.answers?.some(answer => 
        answer.answerText?.toLowerCase().includes(searchTermLower)
      )
    )) {
      return false;
    }
    
    // Time filter
    if (timeFilter !== "all") {
      const now = new Date();
      const responseDate = new Date(response.completedAt);
      const diffHours = (now.getTime() - responseDate.getTime()) / (1000 * 60 * 60);
      
      if (timeFilter === "today" && diffHours > 24) return false;
      if (timeFilter === "week" && diffHours > 24 * 7) return false;
      if (timeFilter === "month" && diffHours > 24 * 30) return false;
    }
    
    return true;
  });
  
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };
  
  const formatTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  };
  
  // Helper to get answer text for a specific question
  const getAnswerText = (response: ResponseWithAnswers, questionId: number) => {
    const answer = response.answers?.find(a => a.questionId === questionId);
    return answer?.answerText || "No answer";
  };
  
  if (isLoading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded w-full mb-6"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }
  
  if (!form || !responses) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">Error loading form or responses</p>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-xl font-medium text-gray-900">{form.title} Responses</h3>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>
      
      <div className="mb-5">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search responses"
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Responses</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Respondent
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              {form.questions?.map((question) => (
                <th 
                  key={question.id} 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {question.text}
                </th>
              ))}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredResponses?.map((response) => (
              <tr key={response.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <span className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-lg font-medium text-primary">
                          {response.respondentName
                            ? response.respondentName.split(' ').map(n => n[0]).join('')
                            : '?'}
                        </span>
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {response.respondentName || "Anonymous"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {response.respondentEmail || "No email provided"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(response.completedAt)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatTime(response.completedAt)}
                  </div>
                </td>
                {form.questions?.map((question) => {
                  const answer = getAnswerText(response, question.id);
                  return (
                    <td key={question.id} className="px-6 py-4">
                      {question.type === "multiple_choice" ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {answer}
                        </span>
                      ) : (
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {answer}
                        </div>
                      )}
                    </td>
                  );
                })}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <a href="#" className="text-primary hover:text-indigo-900">
                    View
                  </a>
                </td>
              </tr>
            ))}
            {filteredResponses?.length === 0 && (
              <tr>
                <td colSpan={3 + (form.questions?.length || 0)} className="px-6 py-4 text-center text-sm text-gray-500">
                  No responses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="mt-5 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">1</span> to{" "}
          <span className="font-medium">{filteredResponses?.length || 0}</span> of{" "}
          <span className="font-medium">{responses.length}</span> results
        </div>
        <div className="flex-1 flex justify-end">
          {/* 
            Pagination would go here, but for simplicity we're not implementing
            full pagination features in this demo
          */}
        </div>
      </div>
    </div>
  );
}
