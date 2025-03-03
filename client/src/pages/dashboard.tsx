import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Property, MaintenanceRequest, SecurityAlert } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/dashboard/sidebar";
import PropertyCard from "@/components/dashboard/property-card";
import UtilityMonitor from "@/components/dashboard/utility-monitor";
import SecurityFeed from "@/components/dashboard/security-feed";
import { MaintenanceRequestForm } from "@/components/maintenance/request-form";
import { CompletionForm } from "@/components/maintenance/completion-form";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Loader2, Wrench, Home } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Dashboard() {
  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);

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

    console.log('Attempting WebSocket connection to:', wsUrl);

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connection established');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "MAINTENANCE_REQUEST") {
        // Refresh maintenance requests list
        queryClient.invalidateQueries({ queryKey: ["/api/maintenance"] });
      }
      if (data.type === "SECURITY_ALERT" || data.type === "URGENT_MAINTENANCE") {
        queryClient.invalidateQueries({ queryKey: ["/api/alerts"] });
        queryClient.invalidateQueries({ queryKey: ["/api/maintenance"] });
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    wsRef.current = ws;
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  if (propertiesLoading || maintenanceLoading || alertsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Get property details for a maintenance request
  const getPropertyDetails = (propertyId: number) => {
    return properties?.find(p => p.id === propertyId);
  };

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
                {user?.role === "tenant" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMaintenanceForm(true)}
                  >
                    New Request
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {maintenanceRequests?.map((request) => {
                    const property = getPropertyDetails(request.propertyId);
                    return (
                      <div key={request.id} className="p-4 border rounded-lg space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{request.title}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <Home className="h-4 w-4" />
                              <span>Unit {property?.name}</span>
                              <Wrench className="h-4 w-4 ml-2" />
                              <span className="capitalize">{request.category}</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">{request.description}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              request.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                              request.status === "assigned" ? "bg-blue-100 text-blue-800" :
                              request.status === "completed" ? "bg-green-100 text-green-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {request.status}
                            </span>
                            {user?.role === 'staff' &&
                              request.status !== 'completed' &&
                              request.assignedStaffId === user.id && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedRequest(request)}
                                >
                                  Complete
                                </Button>
                              )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Maintenance Request</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <CompletionForm
              requestId={selectedRequest.id}
              onSuccess={() => setSelectedRequest(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}