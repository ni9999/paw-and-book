import { Router, type IRouter } from "express";
import {
  CompleteAttentionParams,
  CreatePurchaseOrderBody,
  CreatePurchaseOrderResponse,
  GetCalendarQueryParams,
  GetCalendarResponse,
  GetCustomersQueryParams,
  GetCustomersResponse,
  GetDashboardResponse,
  GetInventoryResponse,
  GetJobsQueryParams,
  GetJobsResponse,
  GetReportsResponse,
  GetServicesResponse,
  GetStaffResponse,
  UpdateJobStatusBody,
  UpdateJobStatusParams,
  UpdateJobStatusResponse,
} from "@workspace/api-zod";

type AttentionTone = "brick" | "amber" | "pine" | "retail" | "sage";
type JobStatus = "scheduled" | "in_progress" | "completed" | "issues";
type JobKind = "walks" | "grooming" | "boarding";

type Job = {
  id: string;
  pet: string;
  time: string;
  detail: string;
  staff: string;
  status: JobStatus;
  issue: boolean;
  kind: JobKind;
};

const kpis = [
  { label: "Revenue", value: "$2,140", detail: "12% vs last Tue", tone: "up" as const },
  { label: "Appointments", value: "27", detail: "86% of capacity", tone: "flat" as const },
  { label: "No-shows", value: "1", detail: "vs 0 last week", tone: "down" as const },
  { label: "Retail sales", value: "$380", detail: "8% increase", tone: "up" as const },
  { label: "Avg rating", value: "4.8", detail: "last 7 days", tone: "flat" as const },
  { label: "Open incidents", value: "1", detail: "needs review", tone: "down" as const },
];

const timeline = [
  { id: "tl-milo", label: "Milo · walk", type: "walk" as const, start: 4, end: 13, live: true },
  { id: "tl-coco", label: "Coco · groom", type: "groom" as const, start: 16, end: 23, live: false },
  { id: "tl-dropoff", label: "Boarding drop-off", type: "board" as const, start: 26, end: 40, live: false },
  { id: "tl-duke", label: "Duke · walk", type: "walk" as const, start: 44, end: 52, live: true },
  { id: "tl-bella", label: "Bella · groom", type: "groom" as const, start: 55, end: 65, live: false },
  { id: "tl-restock", label: "Restock", type: "retail" as const, start: 68, end: 74, live: false },
  { id: "tl-rocky", label: "Rocky · sit", type: "walk" as const, start: 78, end: 87, live: false },
  { id: "tl-pickups", label: "Pick-ups", type: "board" as const, start: 90, end: 98, live: false },
];

const attention: Array<{
  id: string;
  title: string;
  meta: string;
  action: string;
  tone: AttentionTone;
}> = [
  { id: "gps-jasper", title: "Walk with Jasper — no GPS ping for 22 min", meta: "Started 10:40 · walker: Tomás", action: "Message walker", tone: "brick" },
  { id: "booking-requests", title: "3 booking requests awaiting approval", meta: "Oldest: 41 min ago", action: "Review", tone: "amber" },
  { id: "grooming-assignment", title: "Grooming table 2 has no staff assigned, 2–4pm", meta: "Booked: Bella, Otis", action: "Assign staff", tone: "pine" },
  { id: "retail-reorder", title: "Salmon treats & medium leashes below reorder point", meta: "2 SKUs critical", action: "Create PO", tone: "retail" },
  { id: "rocky-vaccine", title: "Rocky's vaccination expires in 5 days", meta: "Owner: J. Patel", action: "Message owner", tone: "sage" },
];

const revenue = [
  { label: "W1", value: 40, peak: false },
  { label: "W2", value: 55, peak: false },
  { label: "W3", value: 80, peak: true },
  { label: "W4", value: 62, peak: false },
  { label: "W5", value: 70, peak: false },
  { label: "W6", value: 48, peak: false },
  { label: "W7", value: 58, peak: false },
];

const utilization = [
  { label: "Kennels", value: 74, display: "74%" },
  { label: "Grooming tables", value: 58, display: "58%" },
  { label: "Walker slots", value: 91, display: "91%" },
];

const appointments = [
  { id: "apt-milo-mon", day: "Mon 9", time: "9:00", pet: "Milo", service: "Walk", staff: "Tomás", type: "walk" as const },
  { id: "apt-coco-tue", day: "Tue 10", time: "9:00", pet: "Coco", service: "Bath + trim", staff: "Ana", type: "groom" as const },
  { id: "apt-otis-thu", day: "Thu 12", time: "9:00", pet: "Otis", service: "Boarding · in", staff: "Front desk", type: "board" as const },
  { id: "apt-bella-mon", day: "Mon 9", time: "11:00", pet: "Bella", service: "Full groom", staff: "Ana", type: "groom" as const },
  { id: "apt-group-tue", day: "Tue 10", time: "11:00", pet: "Group", service: "Boarding drop-off", staff: "Front desk", type: "board" as const },
  { id: "apt-duke-wed", day: "Wed 11", time: "11:00", pet: "Duke", service: "Walk", staff: "Sam", type: "walk" as const },
  { id: "apt-store-fri", day: "Fri 13", time: "11:00", pet: "Store", service: "Vendor delivery", staff: "Rina", type: "retail" as const },
  { id: "apt-rocky-tue", day: "Tue 10", time: "1:00 pm", pet: "Rocky", service: "Sit visit", staff: "Tomás", type: "walk" as const },
  { id: "apt-nala-wed", day: "Wed 11", time: "1:00 pm", pet: "Nala", service: "Nail trim", staff: "Ana", type: "groom" as const },
  { id: "apt-otis-fri", day: "Fri 13", time: "1:00 pm", pet: "Otis", service: "Boarding · out", staff: "Front desk", type: "board" as const },
  { id: "apt-zeus-mon", day: "Mon 9", time: "3:00 pm", pet: "Zeus", service: "Full groom", staff: "Ana", type: "groom" as const },
  { id: "apt-milo-wed", day: "Wed 11", time: "3:00 pm", pet: "Milo", service: "Walk", staff: "Sam", type: "walk" as const },
  { id: "apt-coco-thu", day: "Thu 12", time: "3:00 pm", pet: "Coco", service: "Bath", staff: "Ana", type: "groom" as const },
];

const jobs: Job[] = [
  { id: "job-rocky", pet: "Rocky", time: "1:00p", detail: "Sitting visit", staff: "Tomás", status: "scheduled", issue: false, kind: "walks" },
  { id: "job-milo-315", pet: "Milo", time: "3:15p", detail: "Walk", staff: "Sam", status: "scheduled", issue: false, kind: "walks" },
  { id: "job-nina", pet: "Nina", time: "4:00p", detail: "Walk · meds", staff: "Tomás", status: "scheduled", issue: false, kind: "walks" },
  { id: "job-fig", pet: "Fig", time: "4:30p", detail: "Group walk", staff: "Sam", status: "scheduled", issue: false, kind: "walks" },
  { id: "job-duke", pet: "Duke", time: "since 11:50a", detail: "GPS live", staff: "Sam", status: "in_progress", issue: false, kind: "walks" },
  { id: "job-milo-905", pet: "Milo", time: "since 9:05a", detail: "GPS live", staff: "Tomás", status: "in_progress", issue: false, kind: "walks" },
  { id: "job-coco", pet: "Coco", time: "9:40a", detail: "Walk", staff: "Ana", status: "completed", issue: false, kind: "walks" },
  { id: "job-otis", pet: "Otis", time: "10:10a", detail: "Walk", staff: "Sam", status: "completed", issue: false, kind: "walks" },
  { id: "job-bella", pet: "Bella", time: "10:55a", detail: "Walk", staff: "Tomás", status: "completed", issue: false, kind: "walks" },
  { id: "job-jasper", pet: "Jasper", time: "10:40a", detail: "No GPS ping · 22 min", staff: "Tomás", status: "issues", issue: true, kind: "walks" },
  { id: "job-nala-groom", pet: "Nala", time: "2:00p", detail: "Nail trim", staff: "Ana", status: "scheduled", issue: false, kind: "grooming" },
  { id: "job-otis-board", pet: "Otis", time: "overnight", detail: "Boarding", staff: "Front desk", status: "in_progress", issue: false, kind: "boarding" },
];

const customers = [
  { id: "customer-patel", initials: "JP", name: "J. Patel", pet: "Rocky (Labrador)", detail: "last visit 3 days ago", lifetimeValue: "$2,410", segment: "vip" },
  { id: "customer-santos", initials: "MS", name: "M. Santos", pet: "Duke (Boxer)", detail: "last visit today", lifetimeValue: "$860", segment: "all" },
  { id: "customer-khan", initials: "AK", name: "A. Khan", pet: "Nina (Poodle)", detail: "last visit 19 days ago", lifetimeValue: "$310", segment: "at-risk" },
  { id: "customer-reyes", initials: "LR", name: "L. Reyes", pet: "Bella (Shih Tzu)", detail: "last visit today", lifetimeValue: "$1,120", segment: "new" },
];

const inventory = [
  { sku: "SL-204", item: "Salmon treats, 400g", stock: 3, reorderAt: 15, category: "Treats", salesShare: 36 },
  { sku: "LM-118", item: "Medium leash, teal", stock: 2, reorderAt: 10, category: "Toys", salesShare: 19 },
  { sku: "SH-045", item: "Oatmeal shampoo, 1L", stock: 12, reorderAt: 10, category: "Grooming care", salesShare: 17 },
];

const staff = [
  { id: "staff-tomas", initials: "TR", name: "Tomás R.", role: "Walker · Sitter", jobs: 18, rating: 4.9, incidents: 0 },
  { id: "staff-ana", initials: "AG", name: "Ana G.", role: "Groomer", jobs: 14, rating: 4.8, incidents: 0 },
  { id: "staff-sam", initials: "SO", name: "Sam O.", role: "Walker", jobs: 11, rating: 4.6, incidents: 1 },
];

const services = [
  { id: "service-walk", name: "Standard walk (30 min)", detail: "Walks · max 3 dogs/slot", price: "$22.00", modifier: "" },
  { id: "service-groom", name: "Full groom + bath", detail: "Grooming · 90 min · requires vaccination record", price: "$68.00", modifier: "" },
  { id: "service-board", name: "Overnight boarding", detail: "Boarding · per night · kennel required", price: "$45.00", modifier: "" },
  { id: "service-nail", name: "Nail trim", detail: "Grooming add-on · 10 min", price: "$12.00", modifier: "" },
];

const reports = {
  revenueByService: [
    { label: "Walk", value: 60, peak: false },
    { label: "Groom", value: 85, peak: true },
    { label: "Board", value: 70, peak: false },
    { label: "Retail", value: 35, peak: false },
  ],
  quality: [
    { label: "Avg rating", value: 96, display: "4.8" },
    { label: "No-show rate", value: 6, display: "2%" },
    { label: "Incidents /100", value: 9, display: "1.4" },
  ],
};

const router: IRouter = Router();

const getDashboard = () => GetDashboardResponse.parse({ kpis, timeline, attention, revenue, utilization });

router.get("/dashboard", (_req, res) => {
  res.json(getDashboard());
});

router.patch("/attention/:id/complete", (req, res) => {
  const params = CompleteAttentionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid attention item" });
    return;
  }
  const index = attention.findIndex((item) => item.id === params.data.id);
  if (index === -1) {
    res.status(404).json({ error: "Attention item not found" });
    return;
  }
  attention.splice(index, 1);
  res.json(getDashboard());
});

router.get("/calendar", (req, res) => {
  const params = GetCalendarQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: "Invalid calendar filters" });
    return;
  }
  const search = params.data.search.toLowerCase();
  const service = params.data.service.toLowerCase();
  const filtered = appointments.filter((appointment) => {
    const matchesSearch = !search || [appointment.pet, appointment.staff, appointment.service].some((value) => value.toLowerCase().includes(search));
    const matchesService = service === "all" || appointment.type === service.replace("ing", "").replace("s", "") || appointment.service.toLowerCase().includes(service.replace("ing", ""));
    return matchesSearch && matchesService;
  });
  res.json(GetCalendarResponse.parse(filtered));
});

const getJobs = (kind: JobKind = "walks") => {
  const visible = jobs.filter((job) => job.kind === kind);
  return GetJobsResponse.parse({
    scheduled: visible.filter((job) => job.status === "scheduled"),
    inProgress: visible.filter((job) => job.status === "in_progress"),
    completed: visible.filter((job) => job.status === "completed"),
    issues: visible.filter((job) => job.status === "issues"),
  });
};

router.get("/jobs", (req, res) => {
  const params = GetJobsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: "Invalid jobs filter" });
    return;
  }
  const kind = params.data.service === "grooming" || params.data.service === "boarding" ? params.data.service : "walks";
  res.json(getJobs(kind));
});

router.patch("/jobs/:id/status", (req, res) => {
  const params = UpdateJobStatusParams.safeParse(req.params);
  const body = UpdateJobStatusBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid job update" });
    return;
  }
  const job = jobs.find((item) => item.id === params.data.id);
  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }
  job.status = body.data.status as JobStatus;
  job.issue = job.status === "issues";
  res.json(UpdateJobStatusResponse.parse(job));
});

router.get("/customers", (req, res) => {
  const params = GetCustomersQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: "Invalid customer filters" });
    return;
  }
  const search = params.data.search.toLowerCase();
  const segment = params.data.segment;
  const filtered = customers.filter((customer) => {
    const matchesSearch = !search || [customer.name, customer.pet, customer.lifetimeValue].some((value) => value.toLowerCase().includes(search));
    const matchesSegment = segment === "all" || customer.segment === segment;
    return matchesSearch && matchesSegment;
  });
  res.json(GetCustomersResponse.parse(filtered));
});

router.get("/retail/inventory", (_req, res) => {
  res.json(GetInventoryResponse.parse(inventory));
});

router.post("/retail/purchase-orders", (req, res) => {
  const body = CreatePurchaseOrderBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid purchase order" });
    return;
  }
  const order = { id: `po-${Date.now()}`, sku: body.data.sku, quantity: body.data.quantity, status: "Draft" };
  res.status(201).json(CreatePurchaseOrderResponse.parse(order));
});

router.get("/staff", (_req, res) => {
  res.json(GetStaffResponse.parse(staff));
});

router.get("/services", (_req, res) => {
  res.json(GetServicesResponse.parse(services));
});

router.get("/reports", (_req, res) => {
  res.json(GetReportsResponse.parse(reports));
});

export default router;