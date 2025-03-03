import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { analyzeSentiment } from "./openai";
import { createMaintenanceRequest } from "./services/maintenance";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

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

      // Notify via WebSocket for urgent requests
      const sentiment = await analyzeSentiment(req.body.description);
      if (sentiment.rating <= 2) {
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({
              type: "URGENT_MAINTENANCE",
              data: request,
            }));
          }
        });
      }

      res.status(201).json(request);
    } catch (error) {
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