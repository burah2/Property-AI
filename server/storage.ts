import { type InsertUser, type User, type Property, type SecurityAlert, type MaintenanceRequest, type MaintenanceReport, type Invoice, type Payment, type PaymentReminder } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: session.Store;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Property operations
  getProperties(): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  createProperty(property: Omit<Property, "id">): Promise<Property>;

  // Security operations
  getSecurityAlerts(): Promise<SecurityAlert[]>;
  createSecurityAlert(alert: Omit<SecurityAlert, "id">): Promise<SecurityAlert>;

  // Maintenance operations
  getMaintenanceRequests(): Promise<MaintenanceRequest[]>;
  getMaintenanceRequest(id: number): Promise<MaintenanceRequest | undefined>;
  createMaintenanceRequest(request: Omit<MaintenanceRequest, "id">): Promise<MaintenanceRequest>;
  updateMaintenanceRequest(id: number, updates: Partial<MaintenanceRequest>): Promise<MaintenanceRequest>;
  createMaintenanceReport(report: Omit<MaintenanceReport, "id">): Promise<MaintenanceReport>;

  // Invoice operations
  createInvoice(invoice: Omit<Invoice, "id">): Promise<Invoice>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  getInvoicesByTenant(tenantId: number): Promise<Invoice[]>;
  updateInvoiceStatus(id: number, status: string): Promise<Invoice>;

  // Payment operations
  createPayment(payment: Omit<Payment, "id">): Promise<Payment>;
  getPayment(id: number): Promise<Payment | undefined>;
  getPaymentsByInvoice(invoiceId: number): Promise<Payment[]>;
  updatePayment(id: number, updates: Partial<Payment>): Promise<Payment>;

  // Payment reminder operations
  createPaymentReminder(reminder: Omit<PaymentReminder, "id">): Promise<PaymentReminder>;
  getDuePaymentReminders(): Promise<PaymentReminder[]>;
  updatePaymentReminder(id: number, updates: Partial<PaymentReminder>): Promise<PaymentReminder>;

  // Staff operations
  getStaffBySpecialization(specialization: string): Promise<User | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private properties: Map<number, Property>;
  private securityAlerts: Map<number, SecurityAlert>;
  private maintenanceRequests: Map<number, MaintenanceRequest>;
  private maintenanceReports: Map<number, MaintenanceReport>;
  public sessionStore: session.Store;

  private userIdCounter: number;
  private propertyIdCounter: number;
  private alertIdCounter: number;
  private requestIdCounter: number;
  private reportIdCounter: number;
  private invoices: Map<number, Invoice>;
  private payments: Map<number, Payment>;
  private paymentReminders: Map<number, PaymentReminder>;
  private invoiceIdCounter: number;
  private paymentIdCounter: number;
  private reminderIdCounter: number;

  constructor() {
    this.users = new Map();
    this.properties = new Map();
    this.securityAlerts = new Map();
    this.maintenanceRequests = new Map();
    this.maintenanceReports = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    this.userIdCounter = 1;
    this.propertyIdCounter = 1;
    this.alertIdCounter = 1;
    this.requestIdCounter = 1;
    this.reportIdCounter = 1;
    this.invoices = new Map();
    this.payments = new Map();
    this.paymentReminders = new Map();
    this.invoiceIdCounter = 1;
    this.paymentIdCounter = 1;
    this.reminderIdCounter = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const id = this.userIdCounter++;
      const user = { ...insertUser, id };
      this.users.set(id, user);
      console.log('User created successfully:', { id, username: user.username });
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user in storage');
    }
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Property operations
  async getProperties(): Promise<Property[]> {
    return Array.from(this.properties.values());
  }

  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async createProperty(property: Omit<Property, "id">): Promise<Property> {
    const id = this.propertyIdCounter++;
    const newProperty = { ...property, id };
    this.properties.set(id, newProperty);
    return newProperty;
  }

  // Security operations
  async getSecurityAlerts(): Promise<SecurityAlert[]> {
    return Array.from(this.securityAlerts.values());
  }

  async createSecurityAlert(alert: Omit<SecurityAlert, "id">): Promise<SecurityAlert> {
    const id = this.alertIdCounter++;
    const newAlert = { ...alert, id };
    this.securityAlerts.set(id, newAlert);
    return newAlert;
  }

  // Maintenance operations
  async getMaintenanceRequests(): Promise<MaintenanceRequest[]> {
    return Array.from(this.maintenanceRequests.values());
  }

  async getMaintenanceRequest(id: number): Promise<MaintenanceRequest | undefined> {
    return this.maintenanceRequests.get(id);
  }

  async createMaintenanceRequest(request: Omit<MaintenanceRequest, "id">): Promise<MaintenanceRequest> {
    const id = this.requestIdCounter++;
    const newRequest = { ...request, id };
    this.maintenanceRequests.set(id, newRequest);
    return newRequest;
  }

  async updateMaintenanceRequest(id: number, updates: Partial<MaintenanceRequest>): Promise<MaintenanceRequest> {
    const request = Array.from(this.maintenanceRequests.values()).find(r => r.id === id);
    if (!request) {
      throw new Error("Maintenance request not found");
    }
    const updatedRequest = { ...request, ...updates };
    this.maintenanceRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async createMaintenanceReport(report: Omit<MaintenanceReport, "id">): Promise<MaintenanceReport> {
    const id = this.reportIdCounter++;
    const newReport = { ...report, id, createdAt: new Date() };
    this.maintenanceReports.set(id, newReport);
    return newReport;
  }

  // Invoice operations
  async createInvoice(invoice: Omit<Invoice, "id">): Promise<Invoice> {
    const id = this.invoiceIdCounter++;
    const newInvoice = { ...invoice, id };
    this.invoices.set(id, newInvoice);
    return newInvoice;
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async getInvoicesByTenant(tenantId: number): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(
      (invoice) => invoice.tenantId === tenantId
    );
  }

  async updateInvoiceStatus(id: number, status: string): Promise<Invoice> {
    const invoice = await this.getInvoice(id);
    if (!invoice) throw new Error("Invoice not found");
    const updatedInvoice = { ...invoice, status };
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }

  // Payment operations
  async createPayment(payment: Omit<Payment, "id">): Promise<Payment> {
    const id = this.paymentIdCounter++;
    const newPayment = { ...payment, id };
    this.payments.set(id, newPayment);
    return newPayment;
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getPaymentsByInvoice(invoiceId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(
      (payment) => payment.invoiceId === invoiceId
    );
  }

  async updatePayment(id: number, updates: Partial<Payment>): Promise<Payment> {
    const payment = await this.getPayment(id);
    if (!payment) throw new Error("Payment not found");
    const updatedPayment = { ...payment, ...updates };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }

  // Payment reminder operations
  async createPaymentReminder(reminder: Omit<PaymentReminder, "id">): Promise<PaymentReminder> {
    const id = this.reminderIdCounter++;
    const newReminder = { ...reminder, id };
    this.paymentReminders.set(id, newReminder);
    return newReminder;
  }

  async getDuePaymentReminders(): Promise<PaymentReminder[]> {
    const now = new Date();
    return Array.from(this.paymentReminders.values()).filter(
      (reminder) =>
        reminder.status === "pending" && reminder.scheduledFor <= now
    );
  }

  async updatePaymentReminder(id: number, updates: Partial<PaymentReminder>): Promise<PaymentReminder> {
    const reminder = this.paymentReminders.get(id);
    if (!reminder) throw new Error("Payment reminder not found");
    const updatedReminder = { ...reminder, ...updates };
    this.paymentReminders.set(id, updatedReminder);
    return updatedReminder;
  }

  async getStaffBySpecialization(specialization: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.specialization === specialization && user.role === 'staff'
    );
  }
}

export const storage = new MemStorage();