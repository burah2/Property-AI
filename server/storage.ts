import { type InsertUser, type User, type Property, type SecurityAlert, type MaintenanceRequest } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: session.Store;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Property operations
  getProperties(): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  createProperty(property: Omit<Property, "id">): Promise<Property>;
  
  // Security operations
  getSecurityAlerts(): Promise<SecurityAlert[]>;
  createSecurityAlert(alert: Omit<SecurityAlert, "id">): Promise<SecurityAlert>;
  
  // Maintenance operations
  getMaintenanceRequests(): Promise<MaintenanceRequest[]>;
  createMaintenanceRequest(request: Omit<MaintenanceRequest, "id">): Promise<MaintenanceRequest>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private properties: Map<number, Property>;
  private securityAlerts: Map<number, SecurityAlert>;
  private maintenanceRequests: Map<number, MaintenanceRequest>;
  public sessionStore: session.Store;
  
  private userIdCounter: number;
  private propertyIdCounter: number;
  private alertIdCounter: number;
  private requestIdCounter: number;

  constructor() {
    this.users = new Map();
    this.properties = new Map();
    this.securityAlerts = new Map();
    this.maintenanceRequests = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    this.userIdCounter = 1;
    this.propertyIdCounter = 1;
    this.alertIdCounter = 1;
    this.requestIdCounter = 1;
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
    const id = this.userIdCounter++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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

  async createMaintenanceRequest(request: Omit<MaintenanceRequest, "id">): Promise<MaintenanceRequest> {
    const id = this.requestIdCounter++;
    const newRequest = { ...request, id };
    this.maintenanceRequests.set(id, newRequest);
    return newRequest;
  }
}

export const storage = new MemStorage();
