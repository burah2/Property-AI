import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Building2 } from "lucide-react";
import { useState } from "react";

// Mock data - to be replaced with real-time data
const mockData = {
  building: {
    electricity: [
      { time: "00:00", usage: 25.3, cost: 5.06 },
      { time: "04:00", usage: 18.8, cost: 3.76 },
      { time: "08:00", usage: 35.5, cost: 7.10 },
      { time: "12:00", usage: 42.2, cost: 8.44 },
      { time: "16:00", usage: 38.8, cost: 7.76 },
      { time: "20:00", usage: 29.9, cost: 5.98 },
    ],
    water: [
      { time: "00:00", usage: 12.2, cost: 2.44 },
      { time: "04:00", usage: 8.8, cost: 1.76 },
      { time: "08:00", usage: 21.1, cost: 4.22 },
      { time: "12:00", usage: 28.8, cost: 5.76 },
      { time: "16:00", usage: 25.5, cost: 5.10 },
      { time: "20:00", usage: 19.9, cost: 3.98 },
    ],
    gas: [
      { time: "00:00", usage: 5.5, cost: 2.75 },
      { time: "04:00", usage: 3.3, cost: 1.65 },
      { time: "08:00", usage: 12.2, cost: 6.10 },
      { time: "12:00", usage: 15.5, cost: 7.75 },
      { time: "16:00", usage: 13.3, cost: 6.65 },
      { time: "20:00", usage: 8.8, cost: 4.40 },
    ],
  },
  units: {
    "Unit 101": {
      electricity: { usage: 450, cost: 90 },
      water: { usage: 120, cost: 24 },
      gas: { usage: 80, cost: 40 },
    },
    "Unit 102": {
      electricity: { usage: 380, cost: 76 },
      water: { usage: 90, cost: 18 },
      gas: { usage: 60, cost: 30 },
    },
    "Unit 103": {
      electricity: { usage: 520, cost: 104 },
      water: { usage: 150, cost: 30 },
      gas: { usage: 100, cost: 50 },
    },
  },
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function UtilityMonitor() {
  const [timeRange, setTimeRange] = useState("day");
  const [viewMode, setViewMode] = useState("building");

  // Calculate total usage for pie chart
  const unitTotals = Object.entries(mockData.units).map(([unit, data]) => ({
    name: unit,
    value: data.electricity.usage + data.water.usage + data.gas.usage,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Tabs value={viewMode} onValueChange={setViewMode} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="building">Building Overview</TabsTrigger>
            <TabsTrigger value="units">Unit Breakdown</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Last 24 Hours</SelectItem>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {viewMode === "building" ? (
        <Tabs defaultValue="electricity">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="electricity">Electricity</TabsTrigger>
            <TabsTrigger value="water">Water</TabsTrigger>
            <TabsTrigger value="gas">Gas</TabsTrigger>
          </TabsList>

          {Object.entries(mockData.building).map(([utility, data]) => (
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
                      name={`${utility} Usage (${utility === 'electricity' ? 'kWh' : utility === 'water' ? 'm³' : 'm³'})`}
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
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Total Usage Distribution</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={unitTotals}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value.toFixed(1)}`}
                    >
                      {unitTotals.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {Object.entries(mockData.units).map(([unit, data]) => (
              <Card key={unit}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Building2 className="h-5 w-5 mr-2" />
                      <h3 className="font-semibold">{unit}</h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(data).map(([utility, { usage, cost }]) => (
                      <div key={utility}>
                        <p className="text-sm text-muted-foreground capitalize">{utility}</p>
                        <p className="text-lg font-semibold">
                          {usage.toFixed(1)} {utility === 'electricity' ? 'kWh' : 'm³'}
                        </p>
                        <p className="text-sm text-muted-foreground">${cost.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mt-8">
        {Object.entries(mockData.building).map(([utility, data]) => {
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