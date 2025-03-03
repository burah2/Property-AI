import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Property, MaintenanceRequest, SecurityAlert } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/dashboard/sidebar";
import PropertyCard from "@/components/dashboard/property-card";
import UtilityMonitor from "@/components/dashboard/utility-monitor";
import SecurityFeed from "@/components/dashboard/security-feed";
import { MaintenanceRequestForm } from "@/components/maintenance/request-form";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Dashboard() {
  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);

  const { data: properties, isLoading: propertiesLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const { data: maintenanceRequests, isLoading: maintenanceLoading } = useQuery<MaintenanceRequest[]>({
    queryKey: ["/api/maintenance"],
  });

  const { data: securityAlerts, isLoading: alertsLoading } = useQuery<SecurityAlert[]>({
    queryKey: ["/api/alerts"],
  });

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "SECURITY_ALERT" || data.type === "URGENT_MAINTENANCE") {
        queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
        queryClient.invalidateQueries({ queryKey: ["/api/maintenance"] });
      }
    };

    wsRef.current = ws;
    return () => ws.close();
  }, []);

  if (propertiesLoading || maintenanceLoading || alertsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold">
              Welcome, {user?.name}
            </h1>
            <Button variant="outline">Generate Report</Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Smart Metering</CardTitle>
              </CardHeader>
              <CardContent>
                <UtilityMonitor />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <SecurityFeed alerts={securityAlerts || []} />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {properties?.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Maintenance Requests</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowMaintenanceForm(true)}
                >
                  New Request
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {maintenanceRequests?.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{request.title}</p>
                        <p className="text-sm text-muted-foreground">{request.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        request.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        request.status === "in_progress" ? "bg-blue-100 text-blue-800" :
                        "bg-green-100 text-green-800"
                      }`}>
                        {request.status}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Dialog open={showMaintenanceForm} onOpenChange={setShowMaintenanceForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Maintenance Request</DialogTitle>
          </DialogHeader>
          <MaintenanceRequestForm 
            propertyId={properties?.[0]?.id || 0} 
            onSuccess={() => setShowMaintenanceForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}