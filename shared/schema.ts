import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("tenant"),
  name: text("name").notNull(),
  email: text("email").notNull(),
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
  title: text("title").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  name: true,
  email: true,
});

export const insertPropertySchema = createInsertSchema(properties);
export const insertSecurityAlertSchema = createInsertSchema(securityAlerts);
export const insertMaintenanceRequestSchema = createInsertSchema(maintenanceRequests);

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Property = typeof properties.$inferSelect;
export type SecurityAlert = typeof securityAlerts.$inferSelect;
export type MaintenanceRequest = typeof maintenanceRequests.$inferSelect;
