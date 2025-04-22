import React from "react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "@ui/badge";
import { Button } from "@ui/button";
import { ClipboardCheck, BarChart2, Users, Calendar, Star, Megaphone, Inbox } from "lucide-react";
import { mockCategoriesWithStats, formatPercentage, getSentimentLabel } from "../services/categoryData";
import { FormWithQuestions } from "@schemas/schema";

const getCategoryIcon = (icon?: string) => {
  switch (icon) {
    case "star":
      return <Star className="h-5 w-5" />;
    case "users":
      return <Users className="h-5 w-5" />;
    case "calendar":
      return <Calendar className="h-5 w-5" />;
    case "megaphone":
      return <Megaphone className="h-5 w-5" />;
    default:
      return <Inbox className="h-5 w-5" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "draft":
      return <Badge variant="outline" className="text-xs">Draft</Badge>;
    case "active":
      return <Badge variant="default" className="bg-green-500 text-xs">Active</Badge>;
    case "archived":
      return <Badge variant="secondary" className="text-xs">Archived</Badge>;
    default:
      return null;
  }
};

const FormCard = ({
  form,
  onView,
  onEdit,
}: {
  form: FormWithQuestions;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
}) => (
  <Card className="hover:shadow-md transition-shadow flex flex-col h-full">
    <CardHeader className="pb-2">
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="font-bold">{form.title}</CardTitle>
          <CardDescription className="mt-1">
            Created {format(new Date(form.createdAt), "MMM d, yyyy")}
          </CardDescription>
        </div>
        {getStatusBadge(form.status)}
      </div>
    </CardHeader>
    <CardContent className="pb-2 flex-1">
      <p className="text-sm text-muted-foreground line-clamp-2">
        {form.description || "No description provided"}
      </p>
      <div className="flex items-center mt-4 text-sm text-muted-foreground gap-4">
        <div className="flex items-center">
          <ClipboardCheck className="h-4 w-4 mr-1" />
          <span>{form.questions?.length || 0} Questions</span>
        </div>
        <div className="flex items-center">
          <BarChart2 className="h-4 w-4 mr-1" />
          <span>{form.responseCount || 0} Responses</span>
        </div>
      </div>
    </CardContent>
    <CardFooter className="pt-2 flex gap-2">
      <Button variant="outline" size="sm" onClick={() => onView(form.id)}>
        View
      </Button>
      <Button variant="secondary" size="sm" onClick={() => onEdit(form.id)}>
        Edit
      </Button>
    </CardFooter>
  </Card>
);

const FormsPage = () => {
  const [, navigate] = useLocation();

  return (
    <div className="mx-auto max-w-5xl w-full px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Forms</h1>
          <p className="text-gray-600">All your forms, organized by category</p>
        </div>
        <Button className="bg-primary text-white" onClick={() => navigate("/forms/new")}>
          Create New Form
        </Button>
      </div>

      {mockCategoriesWithStats.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardCheck className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No forms found</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Get started by creating a new form.
          </p>
          <Button onClick={() => navigate("/forms/new")} className="mt-4">
            Create New Form
          </Button>
        </div>
      ) : (
        <div className="space-y-12">
          {mockCategoriesWithStats.map((category) => {
            const icon = category.icon ?? "";
            const forms: FormWithQuestions[] = Array.isArray(category.forms) ? category.forms.filter(f => typeof f === 'object' && f !== null && 'id' in f) as FormWithQuestions[] : [];
            const responseRate = typeof category.responseRate === 'number' ? category.responseRate : 0;
            const completionRate = typeof category.completionRate === 'number' ? category.completionRate : 0;
            const averageSentiment = typeof category.averageSentiment === 'number' ? category.averageSentiment : 0;
            return (
              <div key={category.id}>
                <div className="flex items-center mb-2 gap-3">
                  <div
                    className="p-2 rounded-md"
                    style={{ backgroundColor: (category.color || "#eee") + "20" }}
                  >
                    <span className="h-6 w-6" style={{ color: category.color || "#888" }}>
                      {getCategoryIcon(icon)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{category.name}</h2>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>
                <div className="flex gap-6 mt-3 px-3 py-2 bg-muted/30 rounded-md mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Forms:</span>
                    <span>{category.formCount ?? forms.length}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Total Responses:</span>
                    <span>{forms.reduce((acc, f) => acc + (f.responseCount || 0), 0)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Response Rate:</span>
                    <span>{formatPercentage(responseRate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Completion:</span>
                    <span>{formatPercentage(completionRate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Sentiment:</span>
                    <span>{getSentimentLabel(averageSentiment)}</span>
                  </div>
                </div>
                {forms.length === 0 ? (
                  <div className="text-muted-foreground italic mb-8">No forms in this category.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {forms.map((form: FormWithQuestions) => (
                      <FormCard
                        key={form.id}
                        form={form}
                        onView={(id) => navigate(`/forms/${id}/responses`)}
                        onEdit={(id) => navigate(`/forms/edit/${id}`)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FormsPage;