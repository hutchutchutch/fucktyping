import Card from "@components/common/Card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function Analytics({ stats }) {
  const demoData = {
    activeForms: 8,
    totalResponses: 124,
    responseRate: "76%",
    weeklyResponses: [
      { name: "Mon", responses: 12 },
      { name: "Tue", responses: 19 },
      { name: "Wed", responses: 14 },
      { name: "Thu", responses: 21 },
      { name: "Fri", responses: 18 },
      { name: "Sat", responses: 8 },
      { name: "Sun", responses: 6 },
    ],
    formPerformance: [
      { name: "Feedback", responses: 42, completion: 85 },
      { name: "Job App", responses: 16, completion: 92 },
      { name: "Survey", responses: 38, completion: 78 },
      { name: "Contact", responses: 28, completion: 64 },
    ],
  };

  // Use provided stats or fall back to demo data
  const data = stats || demoData;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Card 1 */}
        <Card>
          <Card.Content>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary-100 text-primary-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Active Forms</h3>
                <p className="text-2xl font-semibold">{data.activeForms}</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Stats Card 2 */}
        <Card>
          <Card.Content>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Responses</h3>
                <p className="text-2xl font-semibold">{data.totalResponses}</p>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Stats Card 3 */}
        <Card>
          <Card.Content>
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-amber-100 text-amber-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Response Rate</h3>
                <p className="text-2xl font-semibold">{data.responseRate}</p>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Responses Chart */}
        <Card>
          <Card.Header>
            <Card.Title>Weekly Responses</Card.Title>
            <Card.Description>Number of responses received in the past week</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.weeklyResponses}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="responses"
                    fill="hsl(var(--chart-1))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>

        {/* Form Performance Chart */}
        <Card>
          <Card.Header>
            <Card.Title>Form Performance</Card.Title>
            <Card.Description>Responses and completion rates by form</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.formPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="responses"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="completion"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}

export default Analytics;
