import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  ClipboardDocumentListIcon, 
  EyeIcon, 
  PencilIcon, 
  ChevronRightIcon 
} from "@heroicons/react/24/outline";
import { Form } from "shared/schema";
import { getRecentForms, getRelativeTimeString } from "./services/mockData";

interface FormWithStats extends Form {
  responseCount: number;
  lastResponseDate: Date | null;
}

export default function FormsList() {
  const [, navigate] = useLocation();
  
  // Use mock data service to provide form data
  const mockForms = getRecentForms();
  
  const { data: forms, isLoading, error } = useQuery<FormWithStats[]>({
    queryKey: ["/api/forms"],
    initialData: mockForms,
    enabled: false, // Disable actual API call while using mock data
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white overflow-hidden rounded-xl border border-gray-100 animate-pulse">
            <div className="p-6">
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
      <div className="p-4 bg-red-50 text-red-500 rounded-lg">
        Error loading forms: {error.toString()}
      </div>
    );
  }

  if (!forms || forms.length === 0) {
    return (
      <div className="bg-white overflow-hidden rounded-xl border border-gray-100">
        <div className="p-6 text-center">
          <p className="text-gray-500">No forms created yet. Create your first form!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {forms.map((form) => (
        <div 
          key={form.id} 
          className="bg-white overflow-hidden rounded-xl border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate(`/forms/${form.id}`)}
        >
          <div className="p-6">
            <div className="flex items-start">
              <div className="bg-purple-50 rounded-lg p-3">
                <ClipboardDocumentListIcon className="h-6 w-6 text-purple-500" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="font-medium text-gray-900 line-clamp-1">{form.title}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {form.responseCount === 1 ? '1 response' : `${form.responseCount} responses`}
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center">
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                  form.isActive 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {form.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="ml-2 text-xs text-gray-500">
                  {getRelativeTimeString(form.lastResponseDate)}
                </span>
              </div>
              
              <div className="flex space-x-1">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/forms/${form.id}/responses`);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-700"
                >
                  <EyeIcon className="h-5 w-5" />
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/forms/edit/${form.id}`);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-700"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <ChevronRightIcon className="h-5 w-5 text-gray-300" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
