import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  Home,
  Building2,
  Bell,
  Settings,
  LogOut,
  LineChart,
  Shield,
  MessageSquare,
  CreditCard,
  Users,
} from "lucide-react";
import { Link, useLocation } from "wouter";

const getMenuItems = (role: string) => {
  const baseItems = [
    { icon: Home, label: "Dashboard", href: "/dashboard" },
    { icon: Building2, label: "Properties", href: "/dashboard/properties" },
    { icon: Shield, label: "Security", href: "/dashboard/security" },
    { icon: LineChart, label: "Analytics", href: "/dashboard/analytics" },
    { icon: MessageSquare, label: "Messages", href: "/dashboard/messages" },
    { icon: Bell, label: "Notifications", href: "/dashboard/notifications" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
  ];

  if (role === 'landlord') {
    baseItems.splice(2, 0, { icon: Users, label: "Staff", href: "/dashboard/staff" });
  } else if (role === 'tenant') {
    baseItems.splice(6, 0, { icon: CreditCard, label: "Billing", href: "/dashboard/billing" });
  }

  return baseItems;
};

export default function Sidebar() {
  const { logoutMutation, user } = useAuth();
  const [location] = useLocation();
  const menuItems = getMenuItems(user?.role || '');

  return (
    <div className="w-64 border-r bg-card flex flex-col">
      <div className="p-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          PropSmart
        </h2>
      </div>

      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location === item.href;
            return (
              <li key={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}