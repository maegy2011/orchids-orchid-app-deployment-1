import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const admins = sqliteTable("admins", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const adminSessions = sqliteTable("admin_sessions", {
  id: text("id").primaryKey(),
  adminId: text("admin_id").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const companies = sqliteTable("companies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  dbPath: text("db_path").notNull(),
  managerEmail: text("manager_email").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const supportTickets = sqliteTable("support_tickets", {
  id: text("id").primaryKey(),
  companyId: text("company_id"),
  telegramChatId: text("telegram_chat_id").notNull(),
  telegramUsername: text("telegram_username"),
  subject: text("subject").notNull(),
  status: text("status").notNull().default("open"),
  priority: text("priority").notNull().default("medium"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const ticketMessages = sqliteTable("ticket_messages", {
  id: text("id").primaryKey(),
  ticketId: text("ticket_id").notNull(),
  senderType: text("sender_type").notNull(),
  message: text("message").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const authLogs = sqliteTable("auth_logs", {
  id: text("id").primaryKey(),
  userType: text("user_type").notNull(),
  userEmail: text("user_email").notNull(),
  action: text("action").notNull(),
  success: integer("success", { mode: "boolean" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  errorMessage: text("error_message"),
  companyId: text("company_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
