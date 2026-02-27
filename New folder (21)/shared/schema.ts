import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Stream source schema
export const streamSourceSchema = z.object({
  id: z.number(),
  url: z.string(),
  type: z.enum(["iframe", "m3u8", "mp4"]),
  quality: z.string(),
  label: z.string(),
});

export type StreamSource = z.infer<typeof streamSourceSchema>;

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Matches table
export const matches = pgTable("matches", {
  id: varchar("id").primaryKey(),
  team1: text("team1").notNull(),
  team2: text("team2").notNull(),
  team1Logo: text("team1_logo"),
  team2Logo: text("team2_logo"),
  tournament: text("tournament").notNull(),
  time: text("time").notNull(),
  date: text("date"),
  status: text("status").notNull().default("upcoming"),
  streamUrl: text("stream_url"),
  streams: jsonb("streams").$type<StreamSource[]>().default([]),
  viewCount: integer("view_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  createdAt: true,
  viewCount: true,
});

export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matches.$inferSelect;

// Content pages table
export const content = pgTable("content", {
  id: varchar("id").primaryKey(),
  type: text("type").notNull().unique(),
  content: text("content").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertContentSchema = createInsertSchema(content).omit({
  id: true,
  updatedAt: true,
});

export type InsertContent = z.infer<typeof insertContentSchema>;
export type Content = typeof content.$inferSelect;

// Ads table
export const ads = pgTable("ads", {
  id: varchar("id").primaryKey(),
  position: text("position").notNull().unique(),
  content: text("content"),
  enabled: boolean("enabled").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAdSchema = createInsertSchema(ads).omit({
  id: true,
  updatedAt: true,
});

export type InsertAd = z.infer<typeof insertAdSchema>;
export type Ad = typeof ads.$inferSelect;

// Social links table
export const socialLinks = pgTable("social_links", {
  id: varchar("id").primaryKey(),
  platform: text("platform").notNull().unique(),
  url: text("url").notNull(),
  enabled: boolean("enabled").default(true),
});

export const insertSocialLinkSchema = createInsertSchema(socialLinks).omit({
  id: true,
});

export type InsertSocialLink = z.infer<typeof insertSocialLinkSchema>;
export type SocialLink = typeof socialLinks.$inferSelect;

// SEO settings table
export const seoSettings = pgTable("seo_settings", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  keywords: text("keywords"),
});

export const insertSeoSettingsSchema = createInsertSchema(seoSettings).omit({
  id: true,
});

export type InsertSeoSettings = z.infer<typeof insertSeoSettingsSchema>;
export type SeoSettings = typeof seoSettings.$inferSelect;

// Analytics table
export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey(),
  pageViews: integer("page_views").default(0),
  matchViews: jsonb("match_views").$type<Record<string, number>>().default({}),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export type Analytics = typeof analytics.$inferSelect;

// Login schema
export const loginSchema = z.object({
  username: z.string().min(3, "اسم المستخدم يجب أن يكون 3 أحرف على الأقل"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});

export type LoginData = z.infer<typeof loginSchema>;

// Register schema
export const registerSchema = loginSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمات المرور غير متطابقة",
  path: ["confirmPassword"],
});

export type RegisterData = z.infer<typeof registerSchema>;

// Contact form schema
export const contactFormSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("البريد الإلكتروني غير صحيح"),
  message: z.string().min(10, "الرسالة يجب أن تكون 10 أحرف على الأقل"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Teams data type
export interface TeamData {
  name: string;
  logo: string;
}

export interface TeamsDatabase {
  clubs: Record<string, Record<string, TeamData[]>>;
  national: Record<string, TeamData[]>;
  default: string;
}
