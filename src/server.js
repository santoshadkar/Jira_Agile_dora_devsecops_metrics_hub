// HTTP Server implementing OpenAPI 3.0 Specification
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const url = require("node:url");

const {
  getFilteredMetrics,
  getMetricById,
  getRolesSummary,
  getDashboardBlueprint,
  METRICS,
  ROLES
} = require("./services/metricService");

const { generateMetricJql } = require("./services/jqlService");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "127.0.0.1";
const PUBLIC_DIR = path.join(__dirname, "../public");

// MIME types for static assets
const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon"
};

/**
 * Parses JSON body from incoming HTTP request
 */
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk.toString();
      // Guard against huge payload
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

/**
 * Sends a JSON response with CORS headers
 */
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(data, null, 2));
}

/**
 * Main HTTP Request Router
 */
async function handleRequest(req, res) {
  const reqUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = reqUrl.pathname;
  const searchParams = reqUrl.searchParams;
  const method = req.method.toUpperCase();

  // Handle CORS preflight
  if (method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
    return res.end();
  }

  // API Routes
  if (pathname.startsWith("/api/")) {
    try {
      // GET /api/health
      if (pathname === "/api/health" && method === "GET") {
        return sendJson(res, 200, {
          status: "healthy",
          timestamp: new Date().toISOString(),
          version: "1.0.0"
        });
      }

      // GET /api/metrics
      if (pathname === "/api/metrics" && method === "GET") {
        const framework = searchParams.get("framework") || "all";
        const role = searchParams.get("role") || "all";
        const mandate = searchParams.get("mandate") || "all";
        const search = searchParams.get("search") || "";
        const metrics = getFilteredMetrics({ framework, role, mandate, search });
        return sendJson(res, 200, {
          count: metrics.length,
          total: METRICS.length,
          metrics
        });
      }

      // GET /api/metrics/:id
      if (pathname.startsWith("/api/metrics/") && method === "GET") {
        const id = pathname.replace("/api/metrics/", "").trim();
        const metric = getMetricById(id);
        if (!metric) {
          return sendJson(res, 404, { error: `Metric not found: ${id}` });
        }
        return sendJson(res, 200, metric);
      }

      // GET /api/roles
      if (pathname === "/api/roles" && method === "GET") {
        const roles = getRolesSummary();
        return sendJson(res, 200, { roles });
      }

      // GET /api/dashboards/blueprint
      if (pathname === "/api/dashboards/blueprint" && method === "GET") {
        const roleId = searchParams.get("roleId");
        const environment = searchParams.get("environment") || "cloud";
        const projectKey = searchParams.get("projectKey") || "PROJ";
        const boardId = searchParams.get("boardId") || "101";

        if (!roleId) {
          return sendJson(res, 400, { error: "roleId parameter is required" });
        }
        try {
          const blueprint = getDashboardBlueprint(roleId, environment, { projectKey, boardId });
          return sendJson(res, 200, blueprint);
        } catch (err) {
          return sendJson(res, 404, { error: err.message });
        }
      }

      // POST /api/jql/generate
      if (pathname === "/api/jql/generate" && method === "POST") {
        const body = await parseJsonBody(req);
        if (!body.metricId) {
          return sendJson(res, 400, { error: "metricId is required in request body" });
        }
        const metric = getMetricById(body.metricId);
        if (!metric) {
          return sendJson(res, 404, { error: `Metric not found: ${body.metricId}` });
        }
        const generated = generateMetricJql(metric, body);
        return sendJson(res, 200, generated);
      }

      // Fallback for unknown API endpoint
      return sendJson(res, 404, { error: "Endpoint not found" });
    } catch (err) {
      console.error("API Error:", err);
      return sendJson(res, 500, { error: "Internal Server Error", message: err.message });
    }
  }

  // Static File Serving for Web Portal
  let filePath = path.join(PUBLIC_DIR, pathname === "/" ? "index.html" : pathname);

  // Security: prevent path traversal out of public directory
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { "Content-Type": "text/plain" });
    return res.end("Forbidden");
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA client-side routes
      const fallbackPath = path.join(PUBLIC_DIR, "index.html");
      fs.readFile(fallbackPath, (fallbackErr, data) => {
        if (fallbackErr) {
          res.writeHead(404, { "Content-Type": "text/plain" });
          return res.end("File Not Found");
        }
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        return res.end("Error loading file");
      }
      res.writeHead(200, { "Content-Type": contentType });
      res.end(content);
    });
  });
}

/**
 * Creates and starts the HTTP Server
 */
function createServer() {
  return http.createServer(handleRequest);
}

if (require.main === module) {
  const server = createServer();
  server.listen(PORT, HOST, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Jira Agile Metrics Hub Server is running!`);
    console.log(`🌐 Web Portal URL: http://${HOST}:${PORT}`);
    console.log(`📡 API Endpoints : http://${HOST}:${PORT}/api/metrics`);
    console.log(`📋 OpenAPI Spec  : docs/api_spec.json`);
    console.log(`=======================================================`);
  });
}

module.exports = (req, res) => handleRequest(req, res);
module.exports.createServer = createServer;
module.exports.handleRequest = handleRequest;
