export type CustomFetchOptions = RequestInit & {
  responseType?: "json" | "text" | "blob" | "auto";
};

export type ErrorType<T = unknown> = ApiError<T>;

export type BodyType<T> = T;

export type AuthTokenGetter = () => Promise<string | null> | string | null;

const NO_BODY_STATUS = new Set([204, 205, 304]);
const DEFAULT_JSON_ACCEPT = "application/json, application/problem+json";

// ---------------------------------------------------------------------------
// Module-level configuration
// ---------------------------------------------------------------------------

let _baseUrl: string | null = null;
let _authTokenGetter: AuthTokenGetter | null = null;

/**
 * Set a base URL that is prepended to every relative request URL
 * (i.e. paths that start with `/`).
 *
 * Useful for Expo bundles that need to call a remote API server.
 * Pass `null` to clear the base URL.
 */
export function setBaseUrl(url: string | null): void {
  _baseUrl = url ? url.replace(/\/+$/, "") : null;
}

/**
 * Register a getter that supplies a bearer auth token.  Before every fetch
 * the getter is invoked; when it returns a non-null string, an
 * `Authorization: Bearer <token>` header is attached to the request.
 *
 * Useful for Expo bundles making token-gated API calls.
 * Pass `null` to clear the getter.
 *
 * NOTE: This function should never be used in web applications where session
 * token cookies are automatically associated with API calls by the browser.
 */
export function setAuthTokenGetter(getter: AuthTokenGetter | null): void {
  _authTokenGetter = getter;
}

function isRequest(input: RequestInfo | URL): input is Request {
  return typeof Request !== "undefined" && input instanceof Request;
}

function resolveMethod(input: RequestInfo | URL, explicitMethod?: string): string {
  if (explicitMethod) return explicitMethod.toUpperCase();
  if (isRequest(input)) return input.method.toUpperCase();
  return "GET";
}

// Use loose check for URL — some runtimes (e.g. React Native) polyfill URL
// differently, so `instanceof URL` can fail.
function isUrl(input: RequestInfo | URL): input is URL {
  return typeof URL !== "undefined" && input instanceof URL;
}

function applyBaseUrl(input: RequestInfo | URL): RequestInfo | URL {
  if (!_baseUrl) return input;
  const url = resolveUrl(input);
  // Only prepend to relative paths (starting with /)
  if (!url.startsWith("/")) return input;

  const absolute = `${_baseUrl}${url}`;
  if (typeof input === "string") return absolute;
  if (isUrl(input)) return new URL(absolute);
  return new Request(absolute, input as Request);
}

function resolveUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (isUrl(input)) return input.toString();
  return input.url;
}

function mergeHeaders(...sources: Array<HeadersInit | undefined>): Headers {
  const headers = new Headers();

  for (const source of sources) {
    if (!source) continue;
    new Headers(source).forEach((value, key) => {
      headers.set(key, value);
    });
  }

  return headers;
}

function getMediaType(headers: Headers): string | null {
  const value = headers.get("content-type");
  return value ? value.split(";", 1)[0].trim().toLowerCase() : null;
}

function isJsonMediaType(mediaType: string | null): boolean {
  return mediaType === "application/json" || Boolean(mediaType?.endsWith("+json"));
}

function isTextMediaType(mediaType: string | null): boolean {
  return Boolean(
    mediaType &&
      (mediaType.startsWith("text/") ||
        mediaType === "application/xml" ||
        mediaType === "text/xml" ||
        mediaType.endsWith("+xml") ||
        mediaType === "application/x-www-form-urlencoded"),
  );
}

// Use strict equality: in browsers, `response.body` is `null` when the
// response genuinely has no content.  In React Native, `response.body` is
// always `undefined` because the ReadableStream API is not implemented —
// even when the response carries a full payload readable via `.text()` or
// `.json()`.  Loose equality (`== null`) matches both `null` and `undefined`,
// which causes every React Native response to be treated as empty.
function hasNoBody(response: Response, method: string): boolean {
  if (method === "HEAD") return true;
  if (NO_BODY_STATUS.has(response.status)) return true;
  if (response.headers.get("content-length") === "0") return true;
  if (response.body === null) return true;
  return false;
}

function stripBom(text: string): string {
  return text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
}

function looksLikeJson(text: string): boolean {
  const trimmed = text.trimStart();
  return trimmed.startsWith("{") || trimmed.startsWith("[");
}

function getStringField(value: unknown, key: string): string | undefined {
  if (!value || typeof value !== "object") return undefined;

  const candidate = (value as Record<string, unknown>)[key];
  if (typeof candidate !== "string") return undefined;

  const trimmed = candidate.trim();
  return trimmed === "" ? undefined : trimmed;
}

function truncate(text: string, maxLength = 300): string {
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function buildErrorMessage(response: Response, data: unknown): string {
  const prefix = `HTTP ${response.status} ${response.statusText}`;

  if (typeof data === "string") {
    const text = data.trim();
    return text ? `${prefix}: ${truncate(text)}` : prefix;
  }

  const title = getStringField(data, "title");
  const detail = getStringField(data, "detail");
  const message =
    getStringField(data, "message") ??
    getStringField(data, "error_description") ??
    getStringField(data, "error");

  if (title && detail) return `${prefix}: ${title} — ${detail}`;
  if (detail) return `${prefix}: ${detail}`;
  if (message) return `${prefix}: ${message}`;
  if (title) return `${prefix}: ${title}`;

  return prefix;
}

export class ApiError<T = unknown> extends Error {
  readonly name = "ApiError";
  readonly status: number;
  readonly statusText: string;
  readonly data: T | null;
  readonly headers: Headers;
  readonly response: Response;
  readonly method: string;
  readonly url: string;

  constructor(
    response: Response,
    data: T | null,
    requestInfo: { method: string; url: string },
  ) {
    super(buildErrorMessage(response, data));
    Object.setPrototypeOf(this, new.target.prototype);

    this.status = response.status;
    this.statusText = response.statusText;
    this.data = data;
    this.headers = response.headers;
    this.response = response;
    this.method = requestInfo.method;
    this.url = response.url || requestInfo.url;
  }
}

export class ResponseParseError extends Error {
  readonly name = "ResponseParseError";
  readonly status: number;
  readonly statusText: string;
  readonly headers: Headers;
  readonly response: Response;
  readonly method: string;
  readonly url: string;
  readonly rawBody: string;
  readonly cause: unknown;

  constructor(
    response: Response,
    rawBody: string,
    cause: unknown,
    requestInfo: { method: string; url: string },
  ) {
    super(
      `Failed to parse response from ${requestInfo.method} ${response.url || requestInfo.url} ` +
        `(${response.status} ${response.statusText}) as JSON`,
    );
    Object.setPrototypeOf(this, new.target.prototype);

    this.status = response.status;
    this.statusText = response.statusText;
    this.headers = response.headers;
    this.response = response;
    this.method = requestInfo.method;
    this.url = response.url || requestInfo.url;
    this.rawBody = rawBody;
    this.cause = cause;
  }
}

async function parseJsonBody(
  response: Response,
  requestInfo: { method: string; url: string },
): Promise<unknown> {
  const raw = await response.text();
  const normalized = stripBom(raw);

  if (normalized.trim() === "") {
    return null;
  }

  try {
    return JSON.parse(normalized);
  } catch (cause) {
    throw new ResponseParseError(response, raw, cause, requestInfo);
  }
}

async function parseErrorBody(response: Response, method: string): Promise<unknown> {
  if (hasNoBody(response, method)) {
    return null;
  }

  const mediaType = getMediaType(response.headers);

  // Fall back to text when blob() is unavailable (e.g. some React Native builds).
  if (mediaType && !isJsonMediaType(mediaType) && !isTextMediaType(mediaType)) {
    return typeof response.blob === "function" ? response.blob() : response.text();
  }

  const raw = await response.text();
  const normalized = stripBom(raw);
  const trimmed = normalized.trim();

  if (trimmed === "") {
    return null;
  }

  if (isJsonMediaType(mediaType) || looksLikeJson(normalized)) {
    try {
      return JSON.parse(normalized);
    } catch {
      return raw;
    }
  }

  return raw;
}

function inferResponseType(response: Response): "json" | "text" | "blob" {
  const mediaType = getMediaType(response.headers);

  if (isJsonMediaType(mediaType)) return "json";
  if (isTextMediaType(mediaType) || mediaType == null) return "text";
  return "blob";
}

async function parseSuccessBody(
  response: Response,
  responseType: "json" | "text" | "blob" | "auto",
  requestInfo: { method: string; url: string },
): Promise<unknown> {
  if (hasNoBody(response, requestInfo.method)) {
    return null;
  }

  const effectiveType =
    responseType === "auto" ? inferResponseType(response) : responseType;

  switch (effectiveType) {
    case "json":
      return parseJsonBody(response, requestInfo);

    case "text": {
      const text = await response.text();
      return text === "" ? null : text;
    }

    case "blob":
      if (typeof response.blob !== "function") {
        throw new TypeError(
          "Blob responses are not supported in this runtime. " +
            "Use responseType \"json\" or \"text\" instead.",
        );
      }
      return response.blob();
  }
}

function mapPrototypeResponse(url: string, value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  const envelope = value as { success?: boolean; data?: unknown };
  if (envelope.success !== true || !("data" in envelope)) return value;

  const data = envelope.data as any;
  const pathname = url.split("?")[0];

  if (pathname.endsWith("/dashboard") && data?.kpis && !Array.isArray(data.kpis)) {
    const kpiEntries = [
      ["Revenue", `$${Number(data.kpis.revenue ?? 0).toLocaleString()}`, "Today", "up"],
      ["Appointments", String(data.kpis.appointments ?? 0), "Branch capacity", "flat"],
      ["No-shows", String(data.kpis.noShows ?? 0), "Today", "down"],
      ["Retail sales", `$${Number(data.kpis.retailSales ?? 0).toLocaleString()}`, "Today", "up"],
      ["Avg rating", String(data.kpis.averageRating ?? 0), "Last 7 days", "flat"],
      ["Open incidents", String(data.kpis.openIncidents ?? 0), "Needs review", "down"],
    ];
    const categoryToType: Record<string, string> = {
      Walking: "walk",
      Grooming: "groom",
      Boarding: "board",
      Retail: "retail",
    };
    const toTimelineBlock = (job: any) => {
      const start = Number(String(job.startTime ?? "09:00").split(":")[0]) + Number(String(job.startTime ?? "09:00").split(":")[1] ?? 0) / 60;
      const end = Number(String(job.endTime ?? "09:30").split(":")[0]) + Number(String(job.endTime ?? "09:30").split(":")[1] ?? 0) / 60;
      return {
        id: job.id,
        label: `${job.petName} · ${job.service}`,
        type: categoryToType[job.category] ?? "walk",
        start,
        end,
        live: job.status === "In progress",
      };
    };
    const attention = [
      ...(data.needsAttention?.gpsIssues ?? []).map((item: any) => ({
        id: item.id,
        title: item.title,
        meta: `Created ${item.createdAt ?? "today"}`,
        action: "Review",
        tone: "brick",
      })),
      ...(data.needsAttention?.bookingRequests ?? []).map((item: any) => ({
        id: item.id,
        title: `${item.petName} booking request`,
        meta: `${item.customerName} · ${item.requestedTime}`,
        action: "Review",
        tone: "amber",
      })),
      ...(data.needsAttention?.unassignedJobs ?? []).map((item: any) => ({
        id: item.id,
        title: `${item.petName} has no staff assigned`,
        meta: `${item.service} · ${item.startTime}`,
        action: "Assign staff",
        tone: "pine",
      })),
      ...(data.needsAttention?.lowStock ?? []).map((item: any) => ({
        id: item.id,
        title: `${item.name} below reorder point`,
        meta: `${item.stock} in stock · reorder at ${item.reorderPoint}`,
        action: "Create PO",
        tone: "retail",
      })),
      ...(data.needsAttention?.vaccinationAlerts ?? []).map((item: any) => ({
        id: `vaccination-${item.petName}`,
        title: `${item.petName}'s vaccination expires soon`,
        meta: `Owner: ${item.ownerName} · ${item.expires}`,
        action: "Message owner",
        tone: "sage",
      })),
    ];
    const maxRevenue = Math.max(...(data.revenueByService ?? []).map((item: any) => Number(item.revenue) || 0), 1);
    return {
      kpis: kpiEntries.map(([label, value, detail, tone]) => ({ label, value, detail, tone })),
      timeline: (data.timeline ?? []).map(toTimelineBlock),
      attention,
      revenue: (data.revenueByService ?? []).map((item: any, index: number) => ({
        label: String(item.service).slice(0, 3),
        value: Math.round((Number(item.revenue) / maxRevenue) * 100),
        peak: index === 1,
      })),
      utilization: [
        { label: "Kennels", value: data.utilization?.kennels ?? 0, display: `${data.utilization?.kennels ?? 0}%` },
        { label: "Grooming tables", value: data.utilization?.groomingTables ?? 0, display: `${data.utilization?.groomingTables ?? 0}%` },
        { label: "Walker slots", value: data.utilization?.walkerSlots ?? 0, display: `${data.utilization?.walkerSlots ?? 0}%` },
      ],
    };
  }

  if (pathname.endsWith("/calendar") && Array.isArray(data)) {
    return data.map((job: any) => ({
      id: job.id,
      day: job.date,
      time: job.startTime,
      pet: job.petName,
      service: job.service,
      staff: job.staffName ?? "Unassigned",
      type: job.category === "Grooming" ? "groom" : job.category === "Boarding" ? "board" : "walk",
    }));
  }

  if (pathname.endsWith("/jobs") && Array.isArray(data)) {
    const jobs = data.map((job: any) => ({
      id: job.id,
      pet: job.petName,
      time: job.startTime,
      detail: job.service,
      staff: job.staffName ?? "Unassigned",
      status: String(job.status).toLowerCase().replaceAll(" ", "_"),
      issue: job.status === "Issues",
    }));
    return {
      scheduled: jobs.filter((job: any) => job.status === "scheduled"),
      inProgress: jobs.filter((job: any) => job.status === "in_progress"),
      completed: jobs.filter((job: any) => job.status === "completed"),
      issues: jobs.filter((job: any) => job.status === "issues"),
    };
  }

  if (pathname.endsWith("/customers") && Array.isArray(data)) {
    return data.map((customer: any) => ({
      id: customer.id,
      initials: customer.name.split(/\s+/).map((part: string) => part[0]).join("").slice(0, 2),
      name: customer.name,
      pet: customer.pets?.[0] ? `${customer.pets[0].name} (${customer.pets[0].breed})` : "No pet",
      detail: customer.pets?.[0] ? `vaccination ${customer.pets[0].vaccinationExpiry}` : "No pet record",
      lifetimeValue: "$0",
      segment: customer.tag.toLowerCase().replace(" ", "-"),
    }));
  }

  if (pathname.endsWith("/retail/inventory") && Array.isArray(data)) return data;

  if (pathname.endsWith("/staff") && Array.isArray(data)) {
    return data.map((member: any) => ({
      id: member.id,
      initials: member.name.split(/\s+/).map((part: string) => part[0]).join("").slice(0, 2),
      name: member.name,
      role: member.role,
      jobs: member.jobsToday,
      rating: member.rating,
      incidents: 0,
    }));
  }

  if (pathname.endsWith("/services") && Array.isArray(data)) {
    return data.map((service: any) => ({
      id: service.id,
      name: service.name,
      detail: `${service.category} · ${service.durationMinutes} min`,
      price: `$${Number(service.price).toFixed(2)}`,
      modifier: service.active ? "" : "Inactive",
    }));
  }

  if (pathname.endsWith("/reports") && data?.revenueByCategory) {
    return {
      revenueByService: Object.entries(data.revenueByCategory).map(([label, value]) => ({ label, value })),
      quality: [
        { label: "Avg rating", value: 96, display: "4.8" },
        { label: "No-show rate", value: 6, display: "2%" },
        { label: "Incidents /100", value: 9, display: "1.4" },
      ],
    };
  }

  return data;
}

export async function customFetch<T = unknown>(
  input: RequestInfo | URL,
  options: CustomFetchOptions = {},
): Promise<T> {
  input = applyBaseUrl(input);
  const { responseType = "auto", headers: headersInit, ...init } = options;

  const method = resolveMethod(input, init.method);

  if (init.body != null && (method === "GET" || method === "HEAD")) {
    throw new TypeError(`customFetch: ${method} requests cannot have a body.`);
  }

  const headers = mergeHeaders(isRequest(input) ? input.headers : undefined, headersInit);

  if (
    typeof init.body === "string" &&
    !headers.has("content-type") &&
    looksLikeJson(init.body)
  ) {
    headers.set("content-type", "application/json");
  }

  if (responseType === "json" && !headers.has("accept")) {
    headers.set("accept", DEFAULT_JSON_ACCEPT);
  }

  // Attach bearer token when an auth getter is configured and no
  // Authorization header has been explicitly provided.
  if (_authTokenGetter && !headers.has("authorization")) {
    const token = await _authTokenGetter();
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
  }

  const requestInfo = { method, url: resolveUrl(input) };

  const response = await fetch(input, { ...init, method, headers });

  if (!response.ok) {
    const errorData = await parseErrorBody(response, method);
    throw new ApiError(response, errorData, requestInfo);
  }

  const data = await parseSuccessBody(response, responseType, requestInfo);
  return mapPrototypeResponse(requestInfo.url, data) as T;
}
