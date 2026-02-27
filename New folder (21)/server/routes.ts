import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, registerSchema, insertMatchSchema, contactFormSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/auth/login", async (req, res) => {
    try {
      const data = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(data.username);
      
      if (!user || user.password !== data.password) {
        return res.status(401).json({ message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      }

      const { password, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "حدث خطأ في الخادم" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const data = registerSchema.parse(req.body);
      const existing = await storage.getUserByUsername(data.username);
      
      if (existing) {
        return res.status(400).json({ message: "اسم المستخدم مستخدم بالفعل" });
      }

      const user = await storage.createUser({
        username: data.username,
        password: data.password,
        role: "user",
      });

      const { password, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "حدث خطأ في الخادم" });
    }
  });

  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json(safeUsers);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ في الخادم" });
    }
  });

  app.get("/api/matches", async (req, res) => {
    try {
      const matches = await storage.getAllMatches();
      res.json(matches);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ في الخادم" });
    }
  });

  app.get("/api/matches/:id", async (req, res) => {
    try {
      const match = await storage.getMatch(req.params.id);
      if (!match) {
        return res.status(404).json({ message: "المباراة غير موجودة" });
      }
      res.json(match);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ في الخادم" });
    }
  });

  app.post("/api/matches", async (req, res) => {
    try {
      const data = insertMatchSchema.parse(req.body);
      const match = await storage.createMatch(data);
      res.json(match);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "حدث خطأ في الخادم" });
    }
  });

  app.patch("/api/matches/:id", async (req, res) => {
    try {
      const match = await storage.updateMatch(req.params.id, req.body);
      if (!match) {
        return res.status(404).json({ message: "المباراة غير موجودة" });
      }
      res.json(match);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ في الخادم" });
    }
  });

  app.delete("/api/matches/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteMatch(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "المباراة غير موجودة" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ في الخادم" });
    }
  });

  app.get("/api/content/:type", async (req, res) => {
    try {
      const content = await storage.getContent(req.params.type);
      if (!content) {
        return res.json({ type: req.params.type, content: "" });
      }
      res.json(content);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ في الخادم" });
    }
  });

  app.put("/api/content/:type", async (req, res) => {
    try {
      const { content } = req.body;
      if (typeof content !== "string") {
        return res.status(400).json({ message: "المحتوى مطلوب" });
      }
      const updated = await storage.upsertContent(req.params.type, content);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ في الخادم" });
    }
  });

  app.get("/api/ads", async (req, res) => {
    try {
      const ads = await storage.getAllAds();
      res.json(ads);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ في الخادم" });
    }
  });

  app.put("/api/ads/:position", async (req, res) => {
    try {
      const { content } = req.body;
      if (typeof content !== "string") {
        return res.status(400).json({ message: "المحتوى مطلوب" });
      }
      const updated = await storage.upsertAd(req.params.position, content);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ في الخادم" });
    }
  });

  app.get("/api/social-links", async (req, res) => {
    try {
      const links = await storage.getAllSocialLinks();
      res.json(links);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ في الخادم" });
    }
  });

  app.put("/api/social-links/:platform", async (req, res) => {
    try {
      const { url } = req.body;
      if (typeof url !== "string") {
        return res.status(400).json({ message: "الرابط مطلوب" });
      }
      const updated = await storage.upsertSocialLink(req.params.platform, url);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "حدث خطأ في الخادم" });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const data = contactFormSchema.parse(req.body);
      console.log("Contact form submission:", data);
      res.json({ success: true, message: "تم استلام رسالتك بنجاح" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0].message });
      }
      res.status(500).json({ message: "حدث خطأ في الخادم" });
    }
  });

  return httpServer;
}
