// API Integration Tests for Jira Metrics Hub using in-memory request dispatch
const test = require("node:test");
const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const { handleRequest } = require("../scripts/dev-server");

/**
 * Helper to dispatch simulated HTTP requests to handleRequest without opening TCP ports
 */
function dispatchRequest({ method = "GET", url = "/", body = null, headers = {} }) {
  return new Promise((resolve, reject) => {
    // Mock incoming request stream
    const req = new EventEmitter();
    req.method = method;
    req.url = url;
    req.headers = { "content-type": "application/json", ...headers };
    req.destroy = () => {};

    // Mock outgoing response stream
    let statusCode = 200;
    const responseHeaders = {};
    let responseBody = "";

    const res = {
      writeHead: (code, hdrs) => {
        statusCode = code;
        Object.assign(responseHeaders, hdrs);
      },
      end: (data) => {
        if (data) responseBody += data;
        let json = null;
        try {
          json = JSON.parse(responseBody);
        } catch (e) {
          json = responseBody;
        }
        resolve({
          statusCode,
          headers: responseHeaders,
          body: json
        });
      }
    };

    // Invoke handler
    handleRequest(req, res).catch(reject);

    // Feed body chunks if any
    if (body) {
      const dataStr = typeof body === "string" ? body : JSON.stringify(body);
      req.emit("data", Buffer.from(dataStr));
    }
    req.emit("end");
  });
}

test("API: GET /api/health returns 200 and healthy status", async () => {
  const res = await dispatchRequest({ method: "GET", url: "/api/health" });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.status, "healthy");
  assert.ok(res.body.timestamp);
});

test("API: GET /api/metrics returns full metric list and filters", async () => {
  // All metrics
  const resAll = await dispatchRequest({ method: "GET", url: "/api/metrics" });
  assert.strictEqual(resAll.statusCode, 200);
  assert.ok(resAll.body.count > 0);
  assert.ok(Array.isArray(resAll.body.metrics));

  // Filtered by role=scrum-master and mandate=mandated
  const resFiltered = await dispatchRequest({
    method: "GET",
    url: "/api/metrics?role=scrum-master&mandate=mandated"
  });
  assert.strictEqual(resFiltered.statusCode, 200);
  assert.ok(resFiltered.body.count > 0);
  resFiltered.body.metrics.forEach(m => {
    assert.strictEqual(m.roles["scrum-master"].status, "Mandated");
  });
});

test("API: GET /api/metrics/:id returns specific metric details", async () => {
  const res = await dispatchRequest({
    method: "GET",
    url: "/api/metrics/sprint-velocity-predictability"
  });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.id, "sprint-velocity-predictability");
  assert.ok(res.body.cloudJql);
  assert.ok(res.body.dataCenterJql);
});

test("API: GET /api/roles returns all roles summary", async () => {
  const res = await dispatchRequest({ method: "GET", url: "/api/roles" });
  assert.strictEqual(res.statusCode, 200);
  assert.ok(Array.isArray(res.body.roles));
  assert.strictEqual(res.body.roles.length, 6);
});

test("API: GET /api/dashboards/blueprint returns complete setup blueprint", async () => {
  const res = await dispatchRequest({
    method: "GET",
    url: "/api/dashboards/blueprint?roleId=product-owner&environment=cloud&projectKey=FIN"
  });
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.roleId, "product-owner");
  assert.strictEqual(res.body.environment, "Jira Cloud");
  assert.ok(res.body.widgets.length > 0);
  assert.ok(res.body.setupInstructions.length > 0);
});

test("API: POST /api/jql/generate generates customized JQL with parameters", async () => {
  const payload = {
    metricId: "sprint-velocity-predictability",
    projectKey: "PAYMENTS",
    boardId: "555"
  };

  const res = await dispatchRequest({
    method: "POST",
    url: "/api/jql/generate",
    body: payload
  });

  assert.strictEqual(res.statusCode, 200);
  assert.ok(res.body.cloudJql.includes("PAYMENTS"));
  assert.ok(res.body.dataCenterJql.includes("PAYMENTS"));
  assert.strictEqual(res.body.metricId, "sprint-velocity-predictability");
});
