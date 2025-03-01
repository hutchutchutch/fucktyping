import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { FileText } from "lucide-react";
import { Form } from "@shared/schema";

interface FormWithStats extends Form {
  responseCount: number;
  lastResponseDate: Date | null;
}

export default function FormsList() {
  const [, navigate] = useLocation();
  
  const { data: forms, isLoading, error } = useQuery<FormWithStats[]>({
    queryKey: ["/api/forms"],
  });

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return "No responses yet";
    
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  if (isLoading) {
    return (
      <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
            <div className="px-4 py-5 sm:p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 p-4 bg-red-50 text-red-500 rounded-lg">
        Error loading forms: {error.toString()}
      </div>
    );
  }

  if (!forms || forms.length === 0) {
    return (
      <div className="mt-4 bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6 text-center">
          <p className="text-gray-500">No forms created yet. Create your first form!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {forms.map((form) => (
        <div key={form.id} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{form.title}</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{form.responseCount} Responses</div>
                  </dd>
                </dl>
              </div>
            </div>
            <div className="mt-5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Last response: {formatTimeAgo(form.lastResponseDate)}
                </span>
                <span className="text-green-500 font-medium">
                  {form.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="mt-4 flex">
                <button 
                  onClick={() => navigate(`/forms/${form.id}/responses`)}
                  className="text-sm text-primary font-medium hover:text-indigo-700"
                >
                  View Responses
                </button>
                <span className="mx-2 text-gray-500">|</span>
                <button 
                  onClick={() => navigate(`/forms/edit/${form.id}`)}
                  className="text-sm text-primary font-medium hover:text-indigo-700"
                >
                  Edit Form
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
