import Stripe from "stripe";
import nodemailer from "nodemailer";
import AfricasTalking from "africastalking";
import { Invoice, Payment, PaymentReminder } from "@shared/schema";
import { storage } from "../storage";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const africastalking = AfricasTalking({
  apiKey: process.env.AFRICASTALKING_API_KEY!,
  username: process.env.AFRICASTALKING_USERNAME!,
});

const emailTransporter = nodemailer.createTransport({
  // Configure your email service here
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function generateUtilityInvoice(propertyId: number, tenantId: number, utilityData: any) {
  const totalAmount = Object.values(utilityData).reduce((sum: number, usage: any) => sum + usage.cost, 0);
  
  const invoice = await storage.createInvoice({
    propertyId,
    tenantId,
    amount: totalAmount,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    type: "utility",
    period: {
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    },
    details: utilityData,
    status: "pending",
  });

  // Schedule payment reminder
  await schedulePaymentReminder(invoice);

  return invoice;
}

export async function processStripePayment(invoice: Invoice, paymentMethodId: string): Promise<Payment> {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(Number(invoice.amount) * 100), // Convert to cents
    currency: "usd",
    payment_method: paymentMethodId,
    confirm: true,
    return_url: `${process.env.APP_URL}/payment/confirm`,
  });

  const payment = await storage.createPayment({
    invoiceId: invoice.id,
    amount: invoice.amount,
    method: "stripe",
    status: paymentIntent.status === "succeeded" ? "completed" : "pending",
    transactionId: paymentIntent.id,
    metadata: {
      stripePaymentIntentId: paymentIntent.id,
    },
  });

  if (payment.status === "completed") {
    await storage.updateInvoiceStatus(invoice.id, "paid");
  }

  return payment;
}

export async function processMpesaPayment(invoice: Invoice, phoneNumber: string): Promise<Payment> {
  const payment = await storage.createPayment({
    invoiceId: invoice.id,
    amount: invoice.amount,
    method: "mpesa",
    status: "pending",
    metadata: {},
  });

  // Initiate M-Pesa payment
  const response = await africastalking.PAYMENTS.mobileCheckout({
    productName: "PropSmart",
    phoneNumber,
    amount: Number(invoice.amount),
    currency: "KES",
  });

  await storage.updatePayment(payment.id, {
    transactionId: response.transactionId,
    metadata: {
      mpesaTransactionId: response.transactionId,
    },
  });

  return payment;
}

async function schedulePaymentReminder(invoice: Invoice) {
  // Create email reminder
  await storage.createPaymentReminder({
    invoiceId: invoice.id,
    type: "email",
    status: "pending",
    scheduledFor: new Date(invoice.dueDate.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days before due
  });

  // Create SMS reminder
  await storage.createPaymentReminder({
    invoiceId: invoice.id,
    type: "sms",
    status: "pending",
    scheduledFor: new Date(invoice.dueDate.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days before due
  });
}

export async function sendPaymentReminders() {
  const dueReminders = await storage.getDuePaymentReminders();

  for (const reminder of dueReminders) {
    const invoice = await storage.getInvoice(reminder.invoiceId);
    const tenant = await storage.getUser(invoice.tenantId);

    if (reminder.type === "email") {
      await emailTransporter.sendMail({
        to: tenant.email,
        subject: "Payment Reminder: Invoice Due Soon",
        html: `
          <h1>Payment Reminder</h1>
          <p>Your payment of $${invoice.amount} is due on ${invoice.dueDate.toLocaleDateString()}.</p>
          <p>Please log in to your account to make the payment.</p>
        `,
      });
    } else if (reminder.type === "sms") {
      await africastalking.SMS.send({
        to: tenant.phone,
        message: `Payment Reminder: Your payment of $${invoice.amount} is due on ${invoice.dueDate.toLocaleDateString()}. Please log in to make payment.`,
      });
    }

    await storage.updatePaymentReminder(reminder.id, {
      status: "sent",
      sentAt: new Date(),
    });
  }
}
