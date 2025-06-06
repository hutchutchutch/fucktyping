import { useParams } from "wouter";
import ResponseViewerComponent from "@/components/dashboard/ResponseViewer";

export default function ResponseViewer() {
  const { id, formId } = useParams<{ id: string; formId: string }>();
  
  return (
    <div>
      <div className="pb-5 border-b border-gray-200 mb-4">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Response Viewer
        </h3>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <ResponseViewerComponent formId={formId || "1"} responseId={id || "1"} />
      </div>
    </div>
  );
}
