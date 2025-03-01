import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { format } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Loader2, BarChart2, ClipboardCheck, MoreVertical, Edit, Trash2, Copy, Eye, Share2 } from 'lucide-react';
import { mockForms } from '../services/mockData';
import { FormWithQuestions } from '../../../shared/schema';

const FormsPage = () => {
  const [, navigate] = useLocation();
  const [forms, setForms] = useState<FormWithQuestions[]>(mockForms);
  const [isLoading, setIsLoading] = useState(false);
  const [formToDelete, setFormToDelete] = useState<number | null>(null);

  // Filter forms by status
  const draftForms = forms.filter(form => form.status === 'draft');
  const activeForms = forms.filter(form => form.status === 'active');
  const archivedForms = forms.filter(form => form.status === 'archived');

  const handleEditForm = (formId: number) => {
    navigate(`/forms/edit/${formId}`);
  };

  const handleViewResponses = (formId: number) => {
    navigate(`/forms/${formId}/responses`);
  };

  const handleDeleteForm = (formId: number) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setForms(forms.filter(form => form.id !== formId));
      setFormToDelete(null);
      setIsLoading(false);
    }, 800);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="text-xs">Draft</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-green-500 text-xs">Active</Badge>;
      case 'archived':
        return <Badge variant="secondary" className="text-xs">Archived</Badge>;
      default:
        return null;
    }
  };

  const renderFormCard = (form: FormWithQuestions) => (
    <Card key={form.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="font-bold">{form.title}</CardTitle>
            <CardDescription className="mt-1">
              Created {format(new Date(form.createdAt), 'MMM d, yyyy')}
            </CardDescription>
          </div>
          {getStatusBadge(form.status)}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {form.description || "No description provided"}
        </p>
        
        <div className="flex items-center mt-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <ClipboardCheck className="h-4 w-4 mr-1" />
            <span>{form.questions?.length || 0} Questions</span>
          </div>
          <div className="flex items-center ml-4">
            <BarChart2 className="h-4 w-4 mr-1" />
            <span>{form.responseCount || 0} Responses</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <Button variant="outline" size="sm" onClick={() => handleViewResponses(form.id)}>
          View Responses
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleEditForm(form.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Form
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleViewResponses(form.id)}>
              <Eye className="mr-2 h-4 w-4" />
              View Responses
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share2 className="mr-2 h-4 w-4" />
              Share Form
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => setFormToDelete(form.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );

  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="mx-auto h-12 w-12 text-muted-foreground">
        <ClipboardCheck className="h-12 w-12" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No forms found</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Get started by creating a new form.
      </p>
      <Button onClick={() => navigate("/forms/new")} className="mt-4">
        Create New Form
      </Button>
    </div>
  );

  return (
    <div className="container max-w-6xl mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Forms</h1>
          <p className="text-muted-foreground mt-1">
            Manage all your forms and surveys in one place
          </p>
        </div>
        <Button onClick={() => navigate("/forms/new")}>
          Create New Form
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Forms ({forms.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeForms.length})</TabsTrigger>
          <TabsTrigger value="drafts">Drafts ({draftForms.length})</TabsTrigger>
          <TabsTrigger value="archived">Archived ({archivedForms.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {forms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {forms.map(form => renderFormCard(form))}
            </div>
          ) : renderEmptyState()}
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          {activeForms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeForms.map(form => renderFormCard(form))}
            </div>
          ) : renderEmptyState()}
        </TabsContent>
        
        <TabsContent value="drafts" className="space-y-4">
          {draftForms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {draftForms.map(form => renderFormCard(form))}
            </div>
          ) : renderEmptyState()}
        </TabsContent>
        
        <TabsContent value="archived" className="space-y-4">
          {archivedForms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {archivedForms.map(form => renderFormCard(form))}
            </div>
          ) : renderEmptyState()}
        </TabsContent>
      </Tabs>

      {/* Delete confirmation dialog */}
      <AlertDialog open={formToDelete !== null} onOpenChange={() => setFormToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this form and all of its responses. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => formToDelete && handleDeleteForm(formToDelete)}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FormsPage;