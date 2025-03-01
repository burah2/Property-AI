import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Phone } from "lucide-react";
import { Invoice } from "@shared/schema";

interface PaymentFormProps {
  invoice: Invoice;
  onSuccess: () => void;
}

export function PaymentForm({ invoice, onSuccess }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "mpesa">("card");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const response = await fetch(`/api/payments/${paymentMethod}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invoiceId: invoice.id,
          phoneNumber: paymentMethod === "mpesa" ? phoneNumber : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Payment failed");
      }

      toast({
        title: "Payment Initiated",
        description: paymentMethod === "mpesa" 
          ? "Please check your phone for the M-Pesa prompt."
          : "Payment processed successfully.",
      });

      onSuccess();
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Make Payment</CardTitle>
        <CardDescription>
          Choose your preferred payment method
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <RadioGroup
            value={paymentMethod}
            onValueChange={(value) => setPaymentMethod(value as "card" | "mpesa")}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex items-center">
                <CreditCard className="mr-2 h-4 w-4" />
                Credit Card
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="mpesa" id="mpesa" />
              <Label htmlFor="mpesa" className="flex items-center">
                <Phone className="mr-2 h-4 w-4" />
                M-Pesa
              </Label>
            </div>
          </RadioGroup>

          {paymentMethod === "mpesa" && (
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="Enter M-Pesa phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
          )}

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={processing}
            >
              {processing ? "Processing..." : `Pay $${Number(invoice.amount).toFixed(2)}`}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}