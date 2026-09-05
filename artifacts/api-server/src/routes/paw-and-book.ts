import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { Router, type IRouter } from "express";

type Branch = {
  id: string;
  name: string;
  timezone: string;
  currency: string;
};

type Pet = {
  id: string;
  name: string;
  species: string;
  breed: string;
  vaccinationExpiry: string;
};

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  tag: string;
  pets: Pet[];
};

type StaffMember = {
  id: string;
  name: string;
  role: string;
  status: string;
  rating: number;
  jobsToday: number;
};

type Service = {
  id: string;
  name: string;
  category: string;
  durationMinutes: number;
  price: number;
  active: boolean;
};

type Job = {
  id: string;
  petId: string;
  petName: string;
  ownerName: string;
  serviceId: string;
  service: string;
  category: string;
  staffId: string | null;
  staffName: string | null;
  date: string;
  startTime: string;
  endTime: string;
  status: "Scheduled" | "In progress" | "Completed" | "Issues";
  location: string;
  gps?: { status: string; lastPing: string };
};

type InventoryItem = {
  id: string;
  name: string;
  category: string;
  sku: string;
  stock: number;
  reorderPoint: number;
  unitPrice: number;
};

type Sale = {
  id: string;
  date: string;
  category: string;
  amount: number;
};

export type User = {
  id: string;
  name: string;
  role: string;
  email: string;
  password?: string;
  provider?: string;
  avatar?: string;
  createdAt?: string;
};

type Database = {
  branch: Branch;
  users: User[];
  customers: Customer[];
  staff: StaffMember[];
  services: Service[];
  jobs: Job[];
  inventory: InventoryItem[];
  sales: Sale[];
  appointments: Array<Record<string, string>>;
  incidents: Array<Record<string, string>>;
  bookingRequests: Array<Record<string, string>>;
  audit: Array<{
    id: string;
    action: string;
    entity: string;
    entityId: string;
    details: Record<string, unknown>;
    actor: string;
    createdAt: string;
  }>;
};

function getDbFile(): string {
  const primary = path.resolve(process.cwd(), "data/db.json");
  if (fs.existsSync(primary)) return primary;
  const secondary = path.resolve(process.cwd(), "artifacts/api-server/data/db.json");
  if (fs.existsSync(secondary)) return secondary;
  return primary;
}

function loadDb(): Database {
  return JSON.parse(fs.readFileSync(getDbFile(), "utf8")) as Database;
}

function saveDb(db: Database): void {
  const dbFile = getDbFile();
  fs.mkdirSync(path.dirname(dbFile), { recursive: true });
  fs.writeFileSync(dbFile, `${JSON.stringify(db, null, 2)}\n`, "utf8");
}

function ok<T>(res: Parameters<IRouter["get"]>[1] extends never ? never : any, data: T, status = 200) {
  return res.status(status).json({ success: true, data });
}

function fail(res: any, message: string, status = 400) {
  return res.status(status).json({ success: false, error: message });
}

function audit(
  db: Database,
  action: string,
  entity: string,
  entityId: string,
  details: Record<string, unknown> = {},
): void {
  db.audit.push({
    id: randomUUID(),
    action,
    entity,
    entityId,
    details,
    actor: "user_owner_1",
    createdAt: new Date().toISOString(),
  });
}

function queryValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function matchesCategory(job: Job, value: string): boolean {
  const normalized = value.toLowerCase();
  if (!normalized || normalized === "all" || normalized === "walks") return true;
  const aliases: Record<string, string> = {
    walk: "walking",
    walks: "walking",
    groom: "grooming",
    grooming: "grooming",
    board: "boarding",
    boarding: "boarding",
    retail: "retail",
  };
  return job.category.toLowerCase() === (aliases[normalized] ?? normalized);
}

function buildDashboard(db: Database) {
  const today = "2026-09-03";
  const todayJobs = db.jobs.filter((job) => job.date === today);
  const lowStock = db.inventory.filter((item) => item.stock <= item.reorderPoint);
  const openIncidents = db.incidents.filter((incident) => incident.status === "open");
  const pendingBookings = db.bookingRequests.filter((request) => request.status === "awaiting_approval");
  const retailSales = db.sales.reduce((total, sale) => total + sale.amount, 0);

  return {
    branch: db.branch,
    date: today,
    kpis: {
      revenue: 2140,
      appointments: 27,
      noShows: 1,
      retailSales,
      averageRating: 4.8,
      openIncidents: openIncidents.length,
    },
    timeline: todayJobs,
    needsAttention: {
      gpsIssues: openIncidents,
      bookingRequests: pendingBookings,
      unassignedJobs: todayJobs.filter((job) => !job.staffId),
      lowStock,
      vaccinationAlerts: [
        { petName: "Rocky", ownerName: "J. Patel", expires: "2026-10-15" },
      ],
    },
    utilization: { kennels: 74, groomingTables: 58, walkerSlots: 91 },
    topStaff: db.staff.slice().sort((a, b) => b.rating - a.rating),
    revenueByService: [
      { service: "Walking", revenue: 860 },
      { service: "Grooming", revenue: 620 },
      { service: "Boarding", revenue: 480 },
      { service: "Retail", revenue: 380 },
    ],
  };
}

const router: IRouter = Router();

router.get("/health", (_req, res) => {
  ok(res, {
    status: "healthy",
    service: "pawnets-backend",
    time: new Date().toISOString(),
  });
});

router.get("/branch", (_req, res) => {
  ok(res, loadDb().branch);
});

router.get("/me", (_req, res) => {
  ok(res, loadDb().users[0]);
});

router.get("/dashboard", (_req, res) => {
  ok(res, buildDashboard(loadDb()));
});

router.patch("/attention/:id/complete", (req, res) => {
  const db = loadDb();
  const index = db.incidents.findIndex((item) => item.id === req.params.id);
  if (index === -1) return fail(res, "Attention item not found", 404);
  db.incidents.splice(index, 1);
  audit(db, "attention.completed", "incident", req.params.id);
  saveDb(db);
  return ok(res, buildDashboard(db));
});

router.get("/calendar", (req, res) => {
  const db = loadDb();
  const search = queryValue(req.query.q || req.query.search).toLowerCase();
  const service = queryValue(req.query.service).toLowerCase();
  const jobs = db.jobs.filter((job) => {
    const matchesSearch =
      !search ||
      [job.petName, job.ownerName, job.service, job.staffName]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(search));
    return matchesSearch && matchesCategory(job, service);
  });
  return ok(res, jobs);
});

router.patch("/calendar/:jobId", (req, res) => {
  const db = loadDb();
  const job = db.jobs.find((item) => item.id === req.params.jobId);
  if (!job) return fail(res, "Job not found", 404);

  const { date, startTime, endTime, staffId } = req.body as Record<string, unknown>;
  if (date !== undefined) job.date = String(date);
  if (startTime !== undefined) job.startTime = String(startTime);
  if (endTime !== undefined) job.endTime = String(endTime);
  if (staffId !== undefined) {
    job.staffId = staffId === null || staffId === "" ? null : String(staffId);
    const staff = db.staff.find((member) => member.id === job.staffId);
    job.staffName = staff?.name ?? null;
  }

  audit(db, "calendar.update", "job", job.id, { date: job.date, startTime: job.startTime, endTime: job.endTime, staffId: job.staffId });
  saveDb(db);
  return ok(res, job);
});

router.get("/jobs", (req, res) => {
  const db = loadDb();
  const status = queryValue(req.query.status).toLowerCase();
  const category = queryValue(req.query.category || req.query.service);
  const jobs = db.jobs.filter((job) => {
    const statusMatches = !status || job.status.toLowerCase() === status;
    return statusMatches && matchesCategory(job, category);
  });
  return ok(res, jobs);
});

router.patch("/jobs/:id/status", (req, res) => {
  const db = loadDb();
  const job = db.jobs.find((item) => item.id === req.params.id);
  if (!job) return fail(res, "Job not found", 404);
  const nextStatus = req.body?.status;
  const allowed = ["Scheduled", "In progress", "Completed", "Issues", "scheduled", "in_progress", "completed", "issues"];
  if (!allowed.includes(nextStatus)) return fail(res, "Invalid status");

  const statusMap: Record<string, Job["status"]> = {
    scheduled: "Scheduled",
    in_progress: "In progress",
    completed: "Completed",
    issues: "Issues",
  };
  const normalized = statusMap[String(nextStatus)] ?? (nextStatus as Job["status"]);
  const previousStatus = job.status;
  job.status = normalized;
  audit(db, "job.status_changed", "job", job.id, { from: previousStatus, to: normalized });
  saveDb(db);
  return ok(res, job);
});

router.get("/customers", (req, res) => {
  const db = loadDb();
  const search = queryValue(req.query.q || req.query.search).toLowerCase();
  const tag = queryValue(req.query.tag || req.query.segment).toLowerCase();
  const customers = db.customers.filter((customer) => {
    const values = [customer.name, customer.phone, customer.email, customer.tag, ...customer.pets.map((pet) => pet.name)];
    const searchMatches = !search || values.some((value) => value.toLowerCase().includes(search));
    const tagMatches = !tag || tag === "all" || customer.tag.toLowerCase() === tag;
    return searchMatches && tagMatches;
  });
  return ok(res, customers);
});

router.get("/customers/:id", (req, res) => {
  const db = loadDb();
  const customer = db.customers.find((item) => item.id === req.params.id);
  if (!customer) return fail(res, "Customer not found", 404);
  const petIds = new Set(customer.pets.map((pet) => pet.id));
  return ok(res, { customer, jobs: db.jobs.filter((job) => petIds.has(job.petId)) });
});

router.get("/staff", (_req, res) => {
  ok(res, loadDb().staff);
});

router.patch("/staff/:id", (req, res) => {
  const db = loadDb();
  const staff = db.staff.find((member) => member.id === req.params.id);
  if (!staff) return fail(res, "Staff member not found", 404);
  const { status, role, rating } = req.body as Record<string, unknown>;
  if (status !== undefined) staff.status = String(status);
  if (role !== undefined) staff.role = String(role);
  if (rating !== undefined && Number.isFinite(Number(rating))) staff.rating = Number(rating);
  audit(db, "staff.updated", "staff", staff.id, { status: staff.status, role: staff.role, rating: staff.rating });
  saveDb(db);
  return ok(res, staff);
});

router.get("/services", (_req, res) => {
  ok(res, loadDb().services);
});

router.post("/services", (req, res) => {
  const db = loadDb();
  const { name, category, durationMinutes, price } = req.body as Record<string, unknown>;
  if (!name || !category || price === undefined || !Number.isFinite(Number(price))) {
    return fail(res, "name, category and price are required");
  }
  const service: Service = {
    id: randomUUID(),
    name: String(name),
    category: String(category),
    durationMinutes: Number(durationMinutes ?? 30),
    price: Number(price),
    active: true,
  };
  db.services.push(service);
  audit(db, "service.created", "service", service.id, service);
  saveDb(db);
  return ok(res, service, 201);
});

router.patch("/services/:id", (req, res) => {
  const db = loadDb();
  const service = db.services.find((item) => item.id === req.params.id);
  if (!service) return fail(res, "Service not found", 404);
  const { name, category, durationMinutes, price, active } = req.body as Record<string, unknown>;
  if (name !== undefined) service.name = String(name);
  if (category !== undefined) service.category = String(category);
  if (durationMinutes !== undefined) service.durationMinutes = Number(durationMinutes);
  if (price !== undefined) service.price = Number(price);
  if (active !== undefined) service.active = Boolean(active);
  audit(db, "service.updated", "service", service.id, service);
  saveDb(db);
  return ok(res, service);
});

router.get("/inventory", (req, res) => {
  const db = loadDb();
  const items = req.query.lowStock === "true" ? db.inventory.filter((item) => item.stock <= item.reorderPoint) : db.inventory;
  return ok(res, items);
});

router.post("/inventory/:id/purchase-order", (req, res) => {
  const db = loadDb();
  const item = db.inventory.find((inventoryItem) => inventoryItem.id === req.params.id);
  if (!item) return fail(res, "Inventory item not found", 404);
  const quantity = Number(req.body?.quantity ?? 1);
  if (!Number.isFinite(quantity) || quantity <= 0) return fail(res, "Quantity must be greater than zero");
  const purchaseOrder = {
    id: randomUUID(),
    inventoryId: item.id,
    itemName: item.name,
    quantity,
    status: "draft",
    createdAt: new Date().toISOString(),
  };
  audit(db, "inventory.purchase_order_created", "inventory", item.id, purchaseOrder);
  saveDb(db);
  return ok(res, purchaseOrder, 201);
});

router.get("/reports", (req, res) => {
  const db = loadDb();
  const range = queryValue(req.query.range) || "30d";
  const retail = db.sales.reduce((sum, sale) => sum + sale.amount, 0);
  const revenueByCategory: Record<string, number> = {};
  for (const sale of db.sales) revenueByCategory[sale.category] = (revenueByCategory[sale.category] ?? 0) + sale.amount;
  return ok(res, {
    range,
    revenue: { total: 2140 + retail, services: 2140, retail },
    appointments: { total: 27, completed: 23, cancelled: 2, noShows: 1, pending: 1 },
    revenueByCategory,
    utilization: { kennels: 74, groomingTables: 58, walkerSlots: 91 },
  });
});

router.get("/audit", (_req, res) => {
  ok(res, loadDb().audit.slice().reverse());
});

// Compatibility aliases used by the existing React console.
router.get("/retail/inventory", (req, res) => {
  const db = loadDb();
  const items = db.inventory.map((item) => ({
    sku: item.sku,
    item: item.name,
    stock: item.stock,
    reorderAt: item.reorderPoint,
    category: item.category,
    salesShare: 0,
  }));
  return ok(res, req.query.lowStock === "true" ? items.filter((item) => item.stock <= item.reorderAt) : items);
});

router.post("/retail/purchase-orders", (req, res) => {
  const db = loadDb();
  const item = db.inventory.find((inventoryItem) => inventoryItem.sku === req.body?.sku);
  if (!item) return fail(res, "Inventory item not found", 404);
  const quantity = Number(req.body?.quantity);
  if (!Number.isFinite(quantity) || quantity < 1) return fail(res, "Quantity must be greater than zero");
  const purchaseOrder = { id: randomUUID(), inventoryId: item.id, itemName: item.name, quantity, status: "Draft", createdAt: new Date().toISOString() };
  audit(db, "inventory.purchase_order_created", "inventory", item.id, purchaseOrder);
  saveDb(db);
  return ok(res, purchaseOrder, 201);
});

function sanitizeUser(user: User) {
  const { password, ...rest } = user;
  return rest;
}

// Authentication endpoints for testing and database assessment
router.post("/auth/login", (req, res) => {
  const db = loadDb();
  const email = (req.body?.email || "").trim().toLowerCase();
  const password = req.body?.password || "";

  if (!email) {
    return fail(res, "Email address is required");
  }

  const user = db.users.find((u) => u.email.toLowerCase() === email);
  if (!user) {
    return fail(res, "User not found in database. Use Quick Test accounts or register.", 401);
  }

  // In test mode: accept matching password or default test passwords
  if (user.password && user.password !== password && password !== "password123" && password !== "admin" && password !== "test") {
    return fail(res, "Invalid password. In testing mode, you can use 'password123'.", 401);
  }

  audit(db, "auth.login", "user", user.id, { email: user.email, role: user.role, provider: user.provider || "email" });
  saveDb(db);

  return ok(res, {
    user: sanitizeUser(user),
    token: `paw-token-${user.id}-${Date.now()}`,
    message: "Login successful",
  });
});

router.post("/auth/google", (req, res) => {
  const db = loadDb();
  const email = (req.body?.email || "alhamramzrn@gmail.com").trim().toLowerCase();
  const name = (req.body?.name || (email === "alhamramzrn@gmail.com" ? "Alham Ramzrn" : email.split("@")[0])).trim();
  const avatar = req.body?.avatar || name.split(" ").map((s: string) => s[0]).join("").slice(0, 2).toUpperCase();

  let user = db.users.find((u) => u.email.toLowerCase() === email);
  if (!user) {
    user = {
      id: `user_google_${randomUUID().slice(0, 8)}`,
      name,
      email,
      role: "owner",
      provider: "google",
      avatar,
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    audit(db, "auth.google_register", "user", user.id, { email, name });
  } else {
    audit(db, "auth.google_login", "user", user.id, { email, provider: "google" });
  }
  saveDb(db);

  return ok(res, {
    user: sanitizeUser(user),
    token: `paw-token-google-${user.id}-${Date.now()}`,
    message: "Signed in with Google successfully",
  });
});

router.post("/auth/register", (req, res) => {
  const db = loadDb();
  const name = (req.body?.name || "").trim();
  const email = (req.body?.email || "").trim().toLowerCase();
  const password = req.body?.password || "password123";
  const role = req.body?.role || "owner";

  if (!name || !email) {
    return fail(res, "Full name and email address are required");
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === email);
  if (existing) {
    return fail(res, "A user with this email already exists in the database. Please sign in instead.", 409);
  }

  const initials = name
    .split(" ")
    .map((part: string) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "PB";

  const newUser: User = {
    id: `user_${randomUUID().slice(0, 8)}`,
    name,
    email,
    role,
    password,
    provider: "email",
    avatar: initials,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  audit(db, "auth.register", "user", newUser.id, { email, role, name });
  saveDb(db);

  return ok(res, {
    user: sanitizeUser(newUser),
    token: `paw-token-${newUser.id}-${Date.now()}`,
    message: "User registered and stored in database successfully",
  }, 201);
});

router.get("/auth/users", (_req, res) => {
  const db = loadDb();
  return ok(res, db.users.map(sanitizeUser));
});

router.get("/auth/me", (req, res) => {
  const db = loadDb();
  const authHeader = req.headers.authorization || "";
  const emailHeader = (req.headers["x-user-email"] as string) || "";
  
  let user: User | undefined;
  if (emailHeader) {
    user = db.users.find((u) => u.email.toLowerCase() === emailHeader.toLowerCase());
  } else if (authHeader.startsWith("Bearer paw-token-")) {
    const raw = authHeader.replace("Bearer paw-token-", "").replace("google-", "");
    const id = raw.split("-")[0];
    user = db.users.find((u) => u.id === id || u.id === `user_${id}`);
  }
  
  if (!user) {
    user = db.users[0];
  }

  if (!user) {
    return fail(res, "No users found in database", 404);
  }

  return ok(res, sanitizeUser(user));
});

export default router;