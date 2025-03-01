import { pgTable, text, serial, integer, boolean, jsonb, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("tenant"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  specialization: text("specialization"), // For staff: plumber, electrician, etc.
});

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  landlordId: integer("landlord_id").notNull(),
  status: text("status").notNull().default("available"),
  rent: integer("rent").notNull(),
  imageUrl: text("image_url"),
  utilities: jsonb("utilities").notNull().default({}),
});

export const securityAlerts = pgTable("security_alerts", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  type: text("type").notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  status: text("status").notNull().default("unread"),
});

export const maintenanceRequests = pgTable("maintenance_requests", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  tenantId: integer("tenant_id").notNull(),
  assignedStaffId: integer("assigned_staff_id"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // plumbing, electrical, etc.
  status: text("status").notNull().default("pending"),
  priority: text("priority").notNull().default("medium"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  resolution: text("resolution"),
});

export const maintenanceReports = pgTable("maintenance_reports", {
  id: serial("id").primaryKey(),
  requestId: integer("request_id").notNull(),
  staffId: integer("staff_id").notNull(),
  description: text("description").notNull(),
  workDone: text("work_done").notNull(),
  materials: jsonb("materials").notNull().default([]),
  cost: decimal("cost"),
  timeSpent: text("time_spent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull(),
  tenantId: integer("tenant_id").notNull(),
  amount: decimal("amount").notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: text("status").notNull().default("pending"),
  type: text("type").notNull(), 
  period: jsonb("period").notNull(), 
  details: jsonb("details").notNull(), 
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull(),
  amount: decimal("amount").notNull(),
  method: text("method").notNull(), 
  status: text("status").notNull().default("pending"),
  transactionId: text("transaction_id"),
  metadata: jsonb("metadata").notNull().default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const paymentReminders = pgTable("payment_reminders", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull(),
  type: text("type").notNull(), 
  status: text("status").notNull().default("pending"),
  scheduledFor: timestamp("scheduled_for").notNull(),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users);
export const insertPropertySchema = createInsertSchema(properties);
export const insertSecurityAlertSchema = createInsertSchema(securityAlerts);
export const insertMaintenanceRequestSchema = createInsertSchema(maintenanceRequests);
export const insertInvoiceSchema = createInsertSchema(invoices);
export const insertPaymentSchema = createInsertSchema(payments);
export const insertPaymentReminderSchema = createInsertSchema(paymentReminders);
export const insertMaintenanceReportSchema = createInsertSchema(maintenanceReports);

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Property = typeof properties.$inferSelect;
export type SecurityAlert = typeof securityAlerts.$inferSelect;
export type MaintenanceRequest = typeof maintenanceRequests.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type PaymentReminder = typeof paymentReminders.$inferSelect;
export type MaintenanceReport = typeof maintenanceReports.$inferSelect;

// Maintenance categories and their corresponding staff specializations
export const MAINTENANCE_CATEGORIES = {
  plumbing: "plumber",
  electrical: "electrician",
  hvac: "hvac_technician",
  carpentry: "carpenter",
  general: "maintenance_staff",
} as const;