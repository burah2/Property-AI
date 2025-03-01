import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data
const mockData = {
  electricity: [
    { time: "00:00", usage: 2.3 },
    { time: "04:00", usage: 1.8 },
    { time: "08:00", usage: 3.5 },
    { time: "12:00", usage: 4.2 },
    { time: "16:00", usage: 3.8 },
    { time: "20:00", usage: 2.9 },
  ],
  water: [
    { time: "00:00", usage: 1.2 },
    { time: "04:00", usage: 0.8 },
    { time: "08:00", usage: 2.1 },
    { time: "12:00", usage: 2.8 },
    { time: "16:00", usage: 2.5 },
    { time: "20:00", usage: 1.9 },
  ],
  gas: [
    { time: "00:00", usage: 0.5 },
    { time: "04:00", usage: 0.3 },
    { time: "08:00", usage: 1.2 },
    { time: "12:00", usage: 1.5 },
    { time: "16:00", usage: 1.3 },
    { time: "20:00", usage: 0.8 },
  ],
};

export default function UtilityMonitor() {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="electricity">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="electricity">Electricity</TabsTrigger>
          <TabsTrigger value="water">Water</TabsTrigger>
          <TabsTrigger value="gas">Gas</TabsTrigger>
        </TabsList>

        <div className="h-[300px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={mockData.electricity}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="usage"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Tabs>

      <div className="grid grid-cols-3 gap-4">
        {Object.entries(mockData).map(([utility, data]) => {
          const currentUsage = data[data.length - 1].usage;
          const previousUsage = data[data.length - 2].usage;
          const change = ((currentUsage - previousUsage) / previousUsage) * 100;

          return (
            <Card key={utility}>
              <CardContent className="pt-6">
                <h4 className="text-sm font-medium capitalize">{utility}</h4>
                <div className="mt-2">
                  <span className="text-2xl font-bold">
                    {currentUsage.toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">
                    kW/h
                  </span>
                </div>
                <p
                  className={`text-sm mt-1 ${
                    change > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {change > 0 ? "+" : ""}
                  {change.toFixed(1)}% from last hour
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
