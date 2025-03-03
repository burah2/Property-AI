
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
import { z } from "zod";

// User authentication schemas
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["tenant", "owner", "manager"]),
});

// Form validation functions
export const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validatePassword = (password: string) => {
  return password.length >= 6;
};
