import { useQuery } from "@tanstack/react-query";

interface StatsData {
  totalForms: number;
  totalResponses: number;
  completionRate: string;
}

export default function Stats() {
  const { data, isLoading, error } = useQuery<StatsData>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 p-4 bg-red-50 text-red-500 rounded-lg">
        Error loading stats: {error.toString()}
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">Total Forms</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{data?.totalForms || 0}</dd>
          </dl>
        </div>
      </div>
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">Total Responses</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{data?.totalResponses || 0}</dd>
          </dl>
        </div>
      </div>
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">Completion Rate</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{data?.completionRate || "0%"}</dd>
          </dl>
        </div>
      </div>
    </div>
  );
}
