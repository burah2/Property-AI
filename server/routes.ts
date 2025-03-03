import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { analyzeSentiment } from "./openai";
import { createMaintenanceRequest, completeMaintenanceRequest } from "./services/maintenance";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  const httpServer = createServer(app);
  // Configure WebSocket server with explicit port
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws'
  });

  // WebSocket connection handler
  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');

    ws.on('error', console.error);

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });

  // Staff routes
  app.get("/api/staff", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'landlord') return res.sendStatus(401);
    const allUsers = await storage.getAllUsers();
    const staffMembers = allUsers.filter(user => user.role === 'staff');
    res.json(staffMembers);
  });

  // Property routes
  app.get("/api/properties", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const properties = await storage.getProperties();
    res.json(properties);
  });

  app.post("/api/properties", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const property = await storage.createProperty(req.body);
    res.status(201).json(property);
  });

  // Maintenance request routes
  app.get("/api/maintenance", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const requests = await storage.getMaintenanceRequests();
    res.json(requests);
  });

  app.post("/api/maintenance", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const request = await createMaintenanceRequest({
        ...req.body,
        tenantId: req.user.id,
      });

      // Notify via WebSocket for all maintenance requests
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: "MAINTENANCE_REQUEST",
            data: request,
          }));
        }
      });

      res.status(201).json(request);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // New route for completing maintenance requests
  app.post("/api/maintenance/:id/complete", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== 'staff') {
      return res.sendStatus(401);
    }

    try {
      await completeMaintenanceRequest(
        parseInt(req.params.id),
        {
          staffId: req.user.id,
          description: req.body.description,
          workDone: req.body.workDone,
          materials: req.body.materials || [],
          cost: req.body.cost,
          timeSpent: req.body.timeSpent,
        }
      );

      res.sendStatus(200);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Security alert routes
  app.get("/api/alerts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const alerts = await storage.getSecurityAlerts();
    res.json(alerts);
  });

  app.post("/api/alerts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const alert = await storage.createSecurityAlert(req.body);

    // Notify via WebSocket
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: "SECURITY_ALERT",
          data: alert,
        }));
      }
    });

    res.status(201).json(alert);
  });

  return httpServer;
}