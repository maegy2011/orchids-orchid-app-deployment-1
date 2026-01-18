import Database from "better-sqlite3";
import crypto from "crypto";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const DATA_DIR = path.join(process.cwd(), "data");
const MAIN_DB_PATH = path.join(DATA_DIR, "main.db");

const mainDb = new Database(MAIN_DB_PATH);

const hashPassword = (password: string) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

const adminId = uuidv4();
const companyId = uuidv4();
const managerId = uuidv4();

mainDb.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    password TEXT,
    created_at INTEGER NOT NULL
  );
`);

const adminPassword = hashPassword("admin123");
mainDb.prepare(`
  INSERT OR REPLACE INTO admins (id, email, name, password, created_at)
  VALUES (?, ?, ?, ?, ?)
`).run(adminId, "ma.egy2011@gmail.com", "مدير النظام", adminPassword, Date.now());

console.log("✅ Admin created: ma.egy2011@gmail.com / admin123");

mainDb.prepare(`
  INSERT OR REPLACE INTO companies (id, name, slug, db_path, manager_email, is_active, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`).run(
  companyId,
  "شركة النيل للتجارة",
  "nile-trade",
  `tenant_${companyId}.db`,
  "manager@nile-trade.com",
  1,
  Date.now()
);

console.log("✅ Company created: شركة النيل للتجارة (slug: nile-trade)");

const tenantDbPath = path.join(DATA_DIR, `tenant_${companyId}.db`);
const tenantDb = new Database(tenantDbPath);

tenantDb.exec(`
  CREATE TABLE IF NOT EXISTS user (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    email_verified INTEGER NOT NULL,
    image TEXT,
    password TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    role TEXT DEFAULT 'employee'
  );
  CREATE TABLE IF NOT EXISTS branches (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT,
    manager_id TEXT,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS wallets (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    branch_id TEXT,
    balance REAL NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  );
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    wallet_id TEXT NOT NULL,
    amount REAL NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    created_at INTEGER NOT NULL
  );
`);

const managerPassword = hashPassword("manager123");
tenantDb.prepare(`
  INSERT OR REPLACE INTO user (id, name, email, email_verified, password, created_at, updated_at, role)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  managerId,
  "مدير الشركة",
  "manager@nile-trade.com",
  1,
  managerPassword,
  Date.now(),
  Date.now(),
  "manager"
);

console.log("✅ Manager created: manager@nile-trade.com / manager123");

const walletId = uuidv4();
tenantDb.prepare(`
  INSERT OR REPLACE INTO wallets (id, user_id, balance, created_at)
  VALUES (?, ?, ?, ?)
`).run(walletId, managerId, 0, Date.now());

console.log("✅ Wallet created for manager");

console.log("\n📋 Login Details:");
console.log("-------------------");
console.log("🔐 Admin Panel (/admin/login):");
console.log("   Email: ma.egy2011@gmail.com");
console.log("   Password: admin123");
console.log("");
console.log("🏢 Company Login (/login):");
console.log("   Company Slug: nile-trade");
console.log("   Email: manager@nile-trade.com");
console.log("   Password: manager123");

mainDb.close();
tenantDb.close();
