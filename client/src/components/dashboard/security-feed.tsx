import { SecurityAlert } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Camera, AlertTriangle, CheckCircle } from "lucide-react";

interface SecurityFeedProps {
  alerts: SecurityAlert[];
}

export default function SecurityFeed({ alerts }: SecurityFeedProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-2">
            <p className="text-sm font-medium">Front Entrance</p>
          </div>
        </div>
        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <Camera className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-2">
            <p className="text-sm font-medium">Back Entrance</p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Recent Alerts</h3>
          <Button variant="ghost" size="sm">
            Clear All
          </Button>
        </div>

        <ScrollArea className="h-[200px]">
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start space-x-4 p-4 border rounded-lg"
              >
                {alert.status === "unread" ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-500 mt-1" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{alert.type}</p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {alert.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
