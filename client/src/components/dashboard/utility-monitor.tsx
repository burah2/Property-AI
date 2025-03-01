import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AlertCircle } from "lucide-react";

// Mock data - to be replaced with real-time data
const mockData = {
  electricity: [
    { time: "00:00", usage: 2.3, cost: 0.46 },
    { time: "04:00", usage: 1.8, cost: 0.36 },
    { time: "08:00", usage: 3.5, cost: 0.70 },
    { time: "12:00", usage: 4.2, cost: 0.84 },
    { time: "16:00", usage: 3.8, cost: 0.76 },
    { time: "20:00", usage: 2.9, cost: 0.58 },
  ],
  water: [
    { time: "00:00", usage: 1.2, cost: 0.24 },
    { time: "04:00", usage: 0.8, cost: 0.16 },
    { time: "08:00", usage: 2.1, cost: 0.42 },
    { time: "12:00", usage: 2.8, cost: 0.56 },
    { time: "16:00", usage: 2.5, cost: 0.50 },
    { time: "20:00", usage: 1.9, cost: 0.38 },
  ],
  gas: [
    { time: "00:00", usage: 0.5, cost: 0.25 },
    { time: "04:00", usage: 0.3, cost: 0.15 },
    { time: "08:00", usage: 1.2, cost: 0.60 },
    { time: "12:00", usage: 1.5, cost: 0.75 },
    { time: "16:00", usage: 1.3, cost: 0.65 },
    { time: "20:00", usage: 0.8, cost: 0.40 },
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

        {Object.entries(mockData).map(([utility, data]) => (
          <TabsContent key={utility} value={utility}>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="usage"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name={`${utility} Usage (${utility === 'electricity' ? 'kWh' : utility === 'water' ? 'm³' : 'm³'}`}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="cost"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                    name="Cost ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="grid grid-cols-3 gap-4">
        {Object.entries(mockData).map(([utility, data]) => {
          const currentUsage = data[data.length - 1].usage;
          const previousUsage = data[data.length - 2].usage;
          const change = ((currentUsage - previousUsage) / previousUsage) * 100;
          const isHighUsage = change > 20;

          return (
            <Card key={utility}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium capitalize">{utility}</h4>
                    <div className="mt-2">
                      <span className="text-2xl font-bold">
                        {currentUsage.toFixed(1)}
                      </span>
                      <span className="text-sm text-muted-foreground ml-1">
                        {utility === 'electricity' ? 'kWh' : 'm³'}
                      </span>
                    </div>
                  </div>
                  {isHighUsage && (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>
                <p
                  className={`text-sm mt-1 ${
                    change > 0 ? "text-destructive" : "text-green-600"
                  }`}
                >
                  {change > 0 ? "+" : ""}
                  {change.toFixed(1)}% from last hour
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Cost: ${(data[data.length - 1].cost).toFixed(2)}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}