import { useQuery } from "@tanstack/react-query";
import { ChartPieIcon, DocumentIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import { getStatsData } from "@services/mockData";

interface StatsData {
  totalForms: number;
  totalResponses: number;
  completionRate: string;
}

export default function Stats() {
  // Using mock data instead of an API call for now
  const statsData = getStatsData();
  
  const { data, isLoading, error } = useQuery<StatsData>({
    queryKey: ["/api/stats"],
    initialData: statsData,
    enabled: false, // Disable actual API call while using mock data
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white overflow-hidden rounded-xl border border-gray-100">
            <div className="px-4 py-5 animate-pulse">
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
      <div className="p-4 bg-red-50 text-red-500 rounded-lg">
        Error loading stats: {error.toString()}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Forms",
      value: data?.totalForms || 0,
      icon: DocumentIcon,
      color: "bg-purple-50",
      iconColor: "text-purple-500"
    },
    {
      title: "Total Responses",
      value: data?.totalResponses || 0,
      icon: ChartBarIcon,
      color: "bg-blue-50",
      iconColor: "text-blue-500"
    },
    {
      title: "Completion Rate",
      value: data?.completionRate || "0%",
      icon: ChartPieIcon,
      color: "bg-green-50",
      iconColor: "text-green-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {statCards.map((card, index) => (
        <div key={index} className="bg-white overflow-hidden rounded-xl border border-gray-100">
          <div className="p-6 flex items-start space-x-4">
            <div className={`${card.color} p-3 rounded-lg`}>
              <card.icon className={`h-6 w-6 ${card.iconColor}`} />
            </div>
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{card.title}</dt>
              <dd className="mt-1 text-2xl font-semibold text-gray-900">{card.value}</dd>
            </dl>
          </div>
        </div>
      ))}
    </div>
  );
}
