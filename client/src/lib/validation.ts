
import { z } from "zod";

export const loginUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const insertUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Must be a valid email address"),
  phone: z.string().optional(),
  specialization: z.string().optional(),
  role: z.enum(["admin", "staff"]).default("staff"),
});

export type LoginUser = z.infer<typeof loginUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
