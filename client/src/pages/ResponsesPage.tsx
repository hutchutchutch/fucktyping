import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Search, 
  Download, 
  Eye, 
  MoreHorizontal, 
  Star, 
  StarOff,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';
import { mockForms, mockResponses } from '../services/mockData';
import { Form, Question, Response } from '../shared/schema';

interface ResponseData extends Response {
  respondent: string;
  completedAt: string;
  status: 'complete' | 'partial';
  starred: boolean;
}

const ResponsesPage = () => {
  const [match, params] = useRoute<{ formId?: string }>('/forms/:formId/responses');
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentForm, setCurrentForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<ResponseData[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [page, setPage] = useState(1);
  const responsesPerPage = 10;

  useEffect(() => {
    // Simulate data fetching from Supabase
    const fetchData = async () => {
      setIsLoading(true);
      const formId = match ? parseInt(params.formId as string) : null;
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (formId) {
        // Find the form
        const form = mockForms.find(f => f.id === formId) || null;
        setCurrentForm(form);
        
        // Generate dummy responses with additional fields
        const dummyResponses: ResponseData[] = Array.from({ length: 25 }, (_, index) => ({
          id: index + 1,
          formId,
          userId: Math.floor(Math.random() * 10) + 1,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          respondent: `Respondent ${index + 1}`,
          completedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: Math.random() > 0.2 ? 'complete' : 'partial',
          starred: Math.random() > 0.8,
        }));
        
        setResponses(dummyResponses);
        
        // Generate dummy questions
        if (form) {
          const dummyQuestions: Question[] = Array.from({ length: form.questions?.length || 5 }, (_, index) => ({
            id: index + 1,
            formId,
            text: `Question ${index + 1}`,
            type: ['multiple_choice', 'text', 'rating'][Math.floor(Math.random() * 3)] as any,
            required: Math.random() > 0.3,
            order: index + 1,
            options: ['multiple_choice'].includes(['multiple_choice', 'text', 'rating'][Math.floor(Math.random() * 3)]) 
              ? ['Option 1', 'Option 2', 'Option 3'] 
              : null,
          }));
          
          setQuestions(dummyQuestions);
        }
      }
      
      setIsLoading(false);
    };
    
    fetchData();
  }, [match, params]);

  const handleStarResponse = (responseId: number) => {
    setResponses(responses.map(response => 
      response.id === responseId 
        ? { ...response, starred: !response.starred } 
        : response
    ));
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  // Filter and paginate responses
  const filteredResponses = responses.filter(response => 
    response.respondent.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const paginatedResponses = filteredResponses.slice(
    (page - 1) * responsesPerPage,
    page * responsesPerPage
  );
  
  const totalPages = Math.ceil(filteredResponses.length / responsesPerPage);

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                if (page > 1) setPage(page - 1);
              }}
              aria-disabled={page === 1}
              className={page === 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;
            
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (page <= 3) {
              pageNum = i + 1;
              if (i === 4) return (
                <PaginationItem key={i}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            } else if (page >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
              if (i === 0) return (
                <PaginationItem key={i}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            } else {
              if (i === 0) return (
                <PaginationItem key={i}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
              if (i === 4) return (
                <PaginationItem key={i}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
              pageNum = page - 1 + i;
            }
            
            return (
              <PaginationItem key={i}>
                <PaginationLink 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(pageNum);
                  }}
                  isActive={page === pageNum}
                >
                  {pageNum}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          <PaginationItem>
            <PaginationNext 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                if (page < totalPages) setPage(page + 1);
              }}
              aria-disabled={page === totalPages}
              className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  if (!match) {
    return (
      <div className="container max-w-6xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Responses</h1>
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">Select a form to view its responses</p>
              <Button onClick={() => navigate('/forms')}>
                View Forms
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4"
          onClick={() => navigate('/forms')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Forms
        </Button>
        
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold">{currentForm?.title} Responses</h1>
            <p className="text-muted-foreground">
              {filteredResponses.length} responses received
            </p>
          </>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search responses..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button size="sm" variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredResponses.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No responses match your search.</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Respondent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Completed At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedResponses.map((response) => (
                      <TableRow key={response.id}>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleStarResponse(response.id)}
                          >
                            {response.starred ? (
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            ) : (
                              <StarOff className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium">{response.respondent}</TableCell>
                        <TableCell>
                          <span 
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              response.status === 'complete' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {response.status === 'complete' ? 'Complete' : 'Partial'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {format(new Date(response.completedAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Export
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleStarResponse(response.id)}>
                                {response.starred ? (
                                  <>
                                    <StarOff className="mr-2 h-4 w-4" />
                                    Remove Star
                                  </>
                                ) : (
                                  <>
                                    <Star className="mr-2 h-4 w-4" />
                                    Star Response
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing <strong>{(page - 1) * responsesPerPage + 1}</strong> to{" "}
                  <strong>{Math.min(page * responsesPerPage, filteredResponses.length)}</strong> of{" "}
                  <strong>{filteredResponses.length}</strong> responses
                </div>
                {renderPagination()}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResponsesPage;