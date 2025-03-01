import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Plus } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import QuestionEditor from "./QuestionEditor";
import EmailTemplateEditor from "./EmailTemplateEditor";
import { FormWithQuestions } from "@shared/schema";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  emailNotificationEnabled: z.boolean().default(false),
  emailRecipients: z.string().optional(),
  emailSubject: z.string().optional(),
  emailTemplate: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function FormBuilder() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<any[]>([]);
  
  // Fetch existing form if editing
  const { data: existingForm, isLoading } = useQuery<FormWithQuestions>({
    queryKey: id ? [`/api/forms/${id}`] : null,
    enabled: !!id,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      isActive: true,
      emailNotificationEnabled: false,
      emailRecipients: "",
      emailSubject: "",
      emailTemplate: "",
    },
  });

  // Update form with existing data when loaded
  useState(() => {
    if (existingForm) {
      form.reset({
        title: existingForm.title,
        description: existingForm.description || "",
        isActive: existingForm.isActive,
        emailNotificationEnabled: existingForm.emailNotificationEnabled,
        emailRecipients: existingForm.emailRecipients || "",
        emailSubject: existingForm.emailSubject || "",
        emailTemplate: existingForm.emailTemplate || "",
      });
      
      if (existingForm.questions) {
        setQuestions(existingForm.questions);
      }
    }
  });

  const createFormMutation = useMutation({
    mutationFn: async (formData: FormValues) => {
      const response = await apiRequest(
        "POST",
        "/api/forms",
        {
          ...formData,
          userId: 1, // Mock user ID
        }
      );
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Form created",
        description: "Your form has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/forms"] });
      navigate(`/forms/edit/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create form: ${error}`,
        variant: "destructive",
      });
    },
  });

  const updateFormMutation = useMutation({
    mutationFn: async (formData: FormValues) => {
      const response = await apiRequest(
        "PUT",
        `/api/forms/${id}`,
        formData
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Form updated",
        description: "Your form has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/forms"] });
      queryClient.invalidateQueries({ queryKey: [`/api/forms/${id}`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update form: ${error}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormValues) => {
    if (id) {
      updateFormMutation.mutate(data);
    } else {
      createFormMutation.mutate(data);
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `temp-${Date.now()}`,
        formId: id ? parseInt(id) : 0,
        text: "",
        type: "multiple_choice",
        order: questions.length + 1,
        options: [""],
        required: true,
      },
    ]);
  };

  const updateQuestion = (index: number, updatedQuestion: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  if (isLoading && id) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded w-full mb-6"></div>
        <div className="h-24 bg-gray-200 rounded w-full mb-6"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="mb-5">
            <Form.Field
              control={form.control}
              name="title"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="block text-sm font-medium text-gray-700">Form Title</Form.Label>
                  <Form.Control>
                    <Input
                      {...field}
                      placeholder="Enter form title"
                      className="mt-1 block w-full"
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>

          <div className="mb-5">
            <Form.Field
              control={form.control}
              name="description"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="block text-sm font-medium text-gray-700">Description</Form.Label>
                  <Form.Control>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder="Enter form description"
                      className="mt-1 block w-full"
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>

          <div className="border-t border-gray-200 pt-5">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Questions</h3>

            {questions.map((question, index) => (
              <QuestionEditor
                key={question.id || index}
                question={question}
                index={index}
                onChange={(updatedQuestion) => updateQuestion(index, updatedQuestion)}
                onRemove={() => removeQuestion(index)}
              />
            ))}

            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={addQuestion}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </div>

          <div className="border-t border-gray-200 pt-5 mt-5">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Email Notification Settings</h3>
            <EmailTemplateEditor
              enabled={form.watch("emailNotificationEnabled")}
              onEnabledChange={(enabled) => form.setValue("emailNotificationEnabled", enabled)}
              recipients={form.watch("emailRecipients")}
              onRecipientsChange={(val) => form.setValue("emailRecipients", val)}
              subject={form.watch("emailSubject")}
              onSubjectChange={(val) => form.setValue("emailSubject", val)}
              template={form.watch("emailTemplate")}
              onTemplateChange={(val) => form.setValue("emailTemplate", val)}
            />
          </div>

          <div className="mt-5 flex justify-end">
            <Button
              type="button"
              variant="outline"
              className="mr-3"
              onClick={() => navigate("/")}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              className="mr-3"
              onClick={() => {
                form.setValue("isActive", false);
                form.handleSubmit(onSubmit)();
              }}
            >
              Save as Draft
            </Button>
            <Button
              type="submit"
              onClick={() => {
                form.setValue("isActive", true);
              }}
            >
              {id ? "Update Form" : "Publish Form"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
