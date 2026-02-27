import {
  type User,
  type InsertUser,
  type Match,
  type InsertMatch,
  type Content,
  type InsertContent,
  type Ad,
  type InsertAd,
  type SocialLink,
  type InsertSocialLink,
  type StreamSource,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<boolean>;

  getMatch(id: string): Promise<Match | undefined>;
  getAllMatches(): Promise<Match[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: string, data: Partial<Match>): Promise<Match | undefined>;
  deleteMatch(id: string): Promise<boolean>;

  getContent(type: string): Promise<Content | undefined>;
  getAllContent(): Promise<Content[]>;
  upsertContent(type: string, content: string): Promise<Content>;

  getAd(position: string): Promise<Ad | undefined>;
  getAllAds(): Promise<Ad[]>;
  upsertAd(position: string, content: string): Promise<Ad>;

  getSocialLink(platform: string): Promise<SocialLink | undefined>;
  getAllSocialLinks(): Promise<SocialLink[]>;
  upsertSocialLink(platform: string, url: string): Promise<SocialLink>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private matches: Map<string, Match>;
  private content: Map<string, Content>;
  private ads: Map<string, Ad>;
  private socialLinks: Map<string, SocialLink>;

  constructor() {
    this.users = new Map();
    this.matches = new Map();
    this.content = new Map();
    this.ads = new Map();
    this.socialLinks = new Map();

    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    const adminUser: User = {
      id: "admin-1",
      username: "admin",
      password: "admin123",
      role: "admin",
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    const sampleMatches: Match[] = [
      {
        id: "match-1",
        team1: "Liverpool",
        team2: "Manchester City",
        team1Logo: "https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/1200px-Liverpool_FC.svg.png",
        team2Logo: "https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/1200px-Manchester_City_FC_badge.svg.png",
        tournament: "Premier League",
        time: "21:00",
        date: "2024-12-06",
        status: "live",
        streamUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        streams: [
          { id: 1, url: "https://www.youtube.com/embed/dQw4w9WgXcQ", label: "الخادم الرئيسي", quality: "HD", type: "iframe" },
          { id: 2, url: "https://www.youtube.com/embed/dQw4w9WgXcQ", label: "خادم 2", quality: "SD", type: "iframe" },
        ],
        viewCount: 5432,
        createdAt: new Date(),
      },
      {
        id: "match-2",
        team1: "Real Madrid",
        team2: "Barcelona",
        team1Logo: "https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png",
        team2Logo: "https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/1200px-FC_Barcelona_%28crest%29.svg.png",
        tournament: "La Liga",
        time: "22:00",
        date: "2024-12-07",
        status: "upcoming",
        streamUrl: "",
        streams: [],
        viewCount: 0,
        createdAt: new Date(),
      },
      {
        id: "match-3",
        team1: "Al Ahly",
        team2: "Zamalek",
        team1Logo: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8c/Al_Ahly_SC_logo.svg/1200px-Al_Ahly_SC_logo.svg.png",
        team2Logo: "https://upload.wikimedia.org/wikipedia/en/thumb/0/04/ZamalekSC.png/220px-ZamalekSC.png",
        tournament: "الدوري المصري",
        time: "20:00",
        date: "2024-12-08",
        status: "upcoming",
        streamUrl: "",
        streams: [],
        viewCount: 0,
        createdAt: new Date(),
      },
    ];

    sampleMatches.forEach((match) => {
      this.matches.set(match.id, match);
    });

    const defaultSocialLinks: SocialLink[] = [
      { id: "social-1", platform: "youtube", url: "https://youtube.com", enabled: true },
      { id: "social-2", platform: "facebook", url: "https://facebook.com", enabled: true },
      { id: "social-3", platform: "telegram", url: "https://telegram.org", enabled: true },
    ];

    defaultSocialLinks.forEach((link) => {
      this.socialLinks.set(link.platform, link);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      role: insertUser.role || "user",
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updated = { ...user, ...data };
    this.users.set(id, updated);
    return updated;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }

  async getMatch(id: string): Promise<Match | undefined> {
    return this.matches.get(id);
  }

  async getAllMatches(): Promise<Match[]> {
    return Array.from(this.matches.values()).sort((a, b) => {
      if (a.status === "live" && b.status !== "live") return -1;
      if (b.status === "live" && a.status !== "live") return 1;
      return 0;
    });
  }

  async createMatch(insertMatch: InsertMatch): Promise<Match> {
    const id = randomUUID();
    const match: Match = {
      ...insertMatch,
      id,
      viewCount: 0,
      createdAt: new Date(),
    };
    this.matches.set(id, match);
    return match;
  }

  async updateMatch(id: string, data: Partial<Match>): Promise<Match | undefined> {
    const match = this.matches.get(id);
    if (!match) return undefined;
    const updated = { ...match, ...data };
    this.matches.set(id, updated);
    return updated;
  }

  async deleteMatch(id: string): Promise<boolean> {
    return this.matches.delete(id);
  }

  async getContent(type: string): Promise<Content | undefined> {
    return this.content.get(type);
  }

  async getAllContent(): Promise<Content[]> {
    return Array.from(this.content.values());
  }

  async upsertContent(type: string, contentText: string): Promise<Content> {
    const existing = this.content.get(type);
    const content: Content = {
      id: existing?.id || randomUUID(),
      type,
      content: contentText,
      updatedAt: new Date(),
    };
    this.content.set(type, content);
    return content;
  }

  async getAd(position: string): Promise<Ad | undefined> {
    return this.ads.get(position);
  }

  async getAllAds(): Promise<Ad[]> {
    return Array.from(this.ads.values());
  }

  async upsertAd(position: string, contentText: string): Promise<Ad> {
    const existing = this.ads.get(position);
    const ad: Ad = {
      id: existing?.id || randomUUID(),
      position,
      content: contentText,
      enabled: true,
      updatedAt: new Date(),
    };
    this.ads.set(position, ad);
    return ad;
  }

  async getSocialLink(platform: string): Promise<SocialLink | undefined> {
    return this.socialLinks.get(platform);
  }

  async getAllSocialLinks(): Promise<SocialLink[]> {
    return Array.from(this.socialLinks.values());
  }

  async upsertSocialLink(platform: string, url: string): Promise<SocialLink> {
    const existing = this.socialLinks.get(platform);
    const link: SocialLink = {
      id: existing?.id || randomUUID(),
      platform,
      url,
      enabled: true,
    };
    this.socialLinks.set(platform, link);
    return link;
  }
}

export const storage = new MemStorage();
