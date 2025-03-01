import { Skeleton } from "@/components/ui/skeleton";

function Transcript({ text, isLoading = false }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-700 mb-2">Transcript</h4>
      <div className="bg-gray-50 p-4 rounded-lg">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        ) : (
          <p className="text-gray-700">{text}</p>
        )}
      </div>
    </div>
  );
}

export default Transcript;
