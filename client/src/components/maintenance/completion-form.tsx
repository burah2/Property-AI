import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMaintenanceReportSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";

// Ensure we have default values for all form fields
const defaultFormValues = {
  description: "",
  workDone: "",
  materials: [],
  cost: 0,
  timeSpent: 0
};

interface CompletionFormProps {
  requestId: number;
  onSuccess?: () => void;
}

export function CompletionForm({ requestId, onSuccess }: CompletionFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize form with default values to prevent controlled/uncontrolled input switching
  const [formData, setFormData] = useState(defaultFormValues);

  const form = useForm({
    resolver: zodResolver(insertMaintenanceReportSchema),
    defaultValues: {
      requestId,
      ...defaultFormValues,
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", `/api/maintenance/${requestId}/complete`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance"] });
      toast({
        title: "Maintenance Complete",
        description: "The maintenance request has been marked as complete and notifications have been sent.",
      });
      form.reset();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    completeMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resolution Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe what was found and how it was resolved"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="workDone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Work Completed</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="List the tasks completed"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cost ($)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timeSpent"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time Spent</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 2 hours" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={completeMutation.isPending}>
          Mark as Complete
        </Button>
      </form>
    </Form>
  );
}