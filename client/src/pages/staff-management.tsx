import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Phone, Mail, Wrench } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StaffForm } from "@/components/staff/staff-form";

export default function StaffManagementPage() {
  const [showStaffForm, setShowStaffForm] = useState(false);

  const { data: staffMembers, isLoading } = useQuery<User[]>({
    queryKey: ["/api/staff"],
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <Button onClick={() => setShowStaffForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Staff Member
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffMembers?.map((staff) => (
            <Card key={staff.id}>
              <CardHeader>
                <CardTitle>{staff.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Wrench className="h-4 w-4 mr-2" />
                    <span className="capitalize">{staff.specialization}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    <span>{staff.phone || 'No phone number'}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    <span>{staff.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={showStaffForm} onOpenChange={setShowStaffForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
            </DialogHeader>
            <StaffForm onSuccess={() => setShowStaffForm(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}