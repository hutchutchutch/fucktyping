import React, { useState, useEffect } from 'react';
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
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
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
} from "../components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/tabs";
import { 
  Loader2, BarChart2, ClipboardCheck, MoreVertical, Edit, Trash2, Copy, 
  Eye, Share2, Star, Users, Calendar, Megaphone, PlusCircle, Inbox,
  ChevronRight, Percent, ThumbsUp, MessageSquare
} from 'lucide-react';
import { mockForms } from '@services/mockData';
import {  FormWithQuestions, CategoryWithStats  } from "@schemas/schema";
import { Progress } from "@ui/progress";
import { 
  mockCategoriesWithStats, 
  updateFormsWithCategories, 
  formatPercentage, 
  getSentimentLabel
} from '../services/categoryData';

const FormsPage = () => {
  const [, navigate] = useLocation();
  const [forms, setForms] = useState<FormWithQuestions[]>(mockForms);
  const [isLoading, setIsLoading] = useState(false);
  const [formToDelete, setFormToDelete] = useState<number | null>(null);
  const [categories, setCategories] = useState<CategoryWithStats[]>(mockCategoriesWithStats);
  const [viewMode, setViewMode] = useState<'tabs' | 'categories'>('categories');
  const [activeTab, setActiveTab] = useState('all');
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  // Update forms with category information
  useEffect(() => {
    updateFormsWithCategories();
  }, []);

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
      <CardFooter className="pt-2 flex flex-col gap-2">
        <div className="flex justify-between w-full">
          <Button variant="outline" size="sm" onClick={() => handleViewResponses(form.id)}>
            View Responses
          </Button>
          
          <Button 
            variant="default" 
            size="sm" 
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            onClick={() => navigate(`/forms/test?formId=${form.id}`)}
          >
            Test Form
          </Button>
        </div>
        
        <div className="flex w-full justify-end">
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
        </div>
      </CardFooter>
    </Card>
  );

  // Function to get the corresponding icon component for a category
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'star':
        return <Star className="h-5 w-5" />;
      case 'users':
        return <Users className="h-5 w-5" />;
      case 'calendar':
        return <Calendar className="h-5 w-5" />;
      case 'megaphone':
        return <Megaphone className="h-5 w-5" />;
      default:
        return <Inbox className="h-5 w-5" />;
    }
  };

  // Function to render a sentiment badge
  const renderSentimentBadge = (sentiment: number) => {
    let color = '';
    if (sentiment >= 0.8) color = 'bg-green-500';
    else if (sentiment >= 0.6) color = 'bg-green-300';
    else if (sentiment >= 0.4) color = 'bg-yellow-400';
    else if (sentiment >= 0.2) color = 'bg-orange-400';
    else color = 'bg-red-500';

    return (
      <Badge className={`${color} text-white`}>
        <ThumbsUp className="h-3 w-3 mr-1" />
        {getSentimentLabel(sentiment)}
      </Badge>
    );
  };

  // Function to get suggested form template based on category
  const getSuggestedForm = (categoryName: string) => {
    const suggestions: Record<string, { title: string, description: string }> = {
      "Feedback": {
        title: "Customer Satisfaction Survey",
        description: "Gather actionable feedback from customers about their experience with your product or service."
      },
      "HR": {
        title: "Employee Engagement Survey",
        description: "Measure how engaged your employees are and identify areas for workplace improvement."
      },
      "Marketing": {
        title: "Marketing Campaign Effectiveness",
        description: "Evaluate the impact and reach of your latest marketing campaign."
      },
      "Education": {
        title: "Course Evaluation Form",
        description: "Collect student feedback to improve course content and teaching methods."
      },
      "Events": {
        title: "Event Registration Form",
        description: "Streamline your event registration process with this customizable form."
      }
    };
    
    return suggestions[categoryName] || {
      title: `New ${categoryName} Form`,
      description: `Create a form tailored to your ${categoryName.toLowerCase()} needs.`
    };
  };

  // Function to render a category section
  const renderCategorySection = (category: CategoryWithStats) => {
    // Get forms for this category
    const categoryForms = forms.filter(form => form.categoryId === category.id);
    
    if (categoryForms.length === 0) return null;
    
    // Get suggested form for this category
    const suggestedForm = getSuggestedForm(category.name);
    
    return (
      <div key={category.id} className="mb-10">
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <div className="p-2 rounded-md mr-3" style={{ backgroundColor: category.color + '20' }}>
              <div className="h-6 w-6" style={{ color: category.color }}>
                {getCategoryIcon(category.icon || '')}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold">{category.name}</h2>
              <p className="text-sm text-muted-foreground">{category.description}</p>
            </div>
          </div>
          
          {/* Horizontal Stats Bar */}
          <div className="flex gap-6 mt-3 px-3 py-2 bg-muted/30 rounded-md">
            <div className="flex items-center gap-2 text-sm">
              <Percent className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Response Rate:</span>
              <span>{formatPercentage(category.responseRate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ClipboardCheck className="h-4 w-4 text-green-500" />
              <span className="font-medium">Completion Rate:</span>
              <span>{formatPercentage(category.completionRate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ThumbsUp className="h-4 w-4 text-purple-500" />
              <span className="font-medium">Sentiment:</span>
              <span>{renderSentimentBadge(category.averageSentiment || 0)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MessageSquare className="h-4 w-4 text-indigo-500" />
              <span className="font-medium">Forms:</span>
              <span>{categoryForms.length}</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
            {categoryForms.map(form => (
              <div key={form.id} className="min-w-[320px] max-w-[320px]">
                {renderFormCard(form)}
              </div>
            ))}
            <div className="min-w-[320px] max-w-[320px]">
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="font-bold">{suggestedForm.title}</CardTitle>
                      <CardDescription className="mt-1">
                        Suggested Template
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">Template</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {suggestedForm.description}
                  </p>
                  
                  <div className="flex items-center mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <ClipboardCheck className="h-4 w-4 mr-1" />
                      <span>Pre-built Questions</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 flex flex-col gap-2">
                  <Button 
                    className="w-full bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
                    onClick={() => navigate("/forms/new")}
                  >
                    <PlusCircle className="h-4 w-4" />
                    Generate Form
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Function to handle category selection
  const handleCategorySelect = (categoryId: number | null) => {
    setActiveCategory(categoryId);
  };

  // Filter forms by selected category
  const filteredForms = activeCategory 
    ? forms.filter(form => form.categoryId === activeCategory)
    : forms;

  // Function to render the category view when no specific category is selected
  const renderCategoryView = () => {
    if (activeCategory !== null) {
      // Show selected category
      const category = categories.find(cat => cat.id === activeCategory);
      return category ? renderCategorySection(category) : renderEmptyState();
    }
    
    // Show all categories
    return (
      <div className="space-y-6">
        {categories.map(category => renderCategorySection(category))}
      </div>
    );
  };

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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="retro-heading mb-2">My Forms</h1>
          <p className="retro-text text-gray-600">Manage all your forms and surveys in one place</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="retro-text">
            Categories
          </Button>
          <Button variant="outline" className="retro-text">
            Status
          </Button>
          <Button className="retro-text bg-primary text-white">
            Create New Form
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="retro-card p-6">
          <h2 className="retro-subheading mb-4">Customer Feedback</h2>
          <p className="retro-text text-gray-600 mb-4">Forms for gathering customer input and feedback</p>
          
          <div className="flex justify-between items-center mb-4">
            <div className="retro-text">
              <span className="text-gray-600">Response Rate:</span>
              <span className="ml-2 text-green-600">2400%</span>
            </div>
            <div className="retro-text">
              <span className="text-gray-600">Forms:</span>
              <span className="ml-2">1</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="retro-text">
              <span className="text-gray-600">Completion:</span>
              <span className="ml-2 text-green-600">79%</span>
            </div>
            <div className="retro-text">
              <span className="text-gray-600">Sentiment:</span>
              <span className="ml-2 text-green-600">Very Positive</span>
            </div>
          </div>
        </div>

        {/* Add more form category cards here */}
      </div>

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