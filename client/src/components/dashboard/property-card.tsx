import { Property } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin } from "lucide-react";

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const statusColors = {
    available: "bg-green-100 text-green-800",
    occupied: "bg-blue-100 text-blue-800",
    maintenance: "bg-yellow-100 text-yellow-800",
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <img
          src={property.imageUrl || "https://images.unsplash.com/photo-1515923256482-1c04580b477c"}
          alt={property.name}
          className="w-full h-full object-cover"
        />
        <Badge
          className={`absolute top-4 right-4 ${
            statusColors[property.status as keyof typeof statusColors]
          }`}
        >
          {property.status}
        </Badge>
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">{property.name}</h3>
            <div className="flex items-center text-muted-foreground mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span className="text-sm">{property.address}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold">${property.rent}</p>
            <p className="text-sm text-muted-foreground">per month</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          {Object.entries(property.utilities).map(([key, value]) => (
            <div key={key} className="flex items-center">
              <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="capitalize">{key}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
