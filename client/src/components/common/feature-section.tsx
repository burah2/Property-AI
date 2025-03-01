import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  LineChart,
  Home,
  MessageSquare,
  Bell,
  Activity,
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Smart Security",
    description:
      "AI-powered security monitoring with real-time alerts and video feeds.",
  },
  {
    icon: LineChart,
    title: "Utility Analytics",
    description:
      "Track and optimize utility usage with detailed analytics and insights.",
  },
  {
    icon: Home,
    title: "Property Management",
    description:
      "Streamlined property management tools for landlords and tenants.",
  },
  {
    icon: MessageSquare,
    title: "Smart Communication",
    description:
      "AI-enhanced communication platform for efficient property management.",
  },
  {
    icon: Bell,
    title: "Instant Alerts",
    description:
      "Real-time notifications for maintenance requests and security alerts.",
  },
  {
    icon: Activity,
    title: "Performance Tracking",
    description:
      "Monitor property performance and tenant satisfaction in real-time.",
  },
];

export default function FeatureSection() {
  return (
    <div className="py-24 bg-muted">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Smart Features</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience the future of property management with our comprehensive
            suite of smart features and AI-powered tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-2">
              <CardContent className="pt-6">
                <feature.icon className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
