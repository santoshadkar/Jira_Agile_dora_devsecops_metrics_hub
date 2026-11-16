// Automated Unit & Integration Tests for Jira Agile Metrics Hub
const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getFilteredMetrics,
  getMetricById,
  getRolesSummary,
  getDashboardBlueprint,
  METRICS,
  ROLES,
  GADGETS
} = require("../src/services/metricService");

const { interpolateJql, generateMetricJql } = require("../src/services/jqlService");

test("Metrics Integrity: All metrics have required enterprise metadata", () => {
  assert.ok(METRICS.length >= 10, "Should have at least 10 core metrics defined");

  const idSet = new Set();
  const validFrameworks = ["Scrum", "Kanban", "Hybrid", "DORA", "DevSecOps"];

  METRICS.forEach(metric => {
    // Unique ID
    assert.ok(metric.id, "Metric must have an ID");
    assert.ok(!idSet.has(metric.id), `Duplicate metric ID found: ${metric.id}`);
    idSet.add(metric.id);

    // Required fields
    assert.ok(metric.name, `Metric ${metric.id} must have a name`);
    assert.ok(validFrameworks.includes(metric.framework), `Metric ${metric.id} has invalid framework ${metric.framework}`);
    assert.ok(metric.purpose, `Metric ${metric.id} must have a purpose`);
    assert.ok(metric.formula, `Metric ${metric.id} must have a formula`);
    assert.ok(metric.benchmark, `Metric ${metric.id} must have a benchmark`);

    // Dual JQL
    assert.ok(metric.cloudJql, `Metric ${metric.id} must have cloudJql`);
    assert.ok(metric.dataCenterJql, `Metric ${metric.id} must have dataCenterJql`);

    // All 6 roles mapped
    ROLES.forEach(role => {
      assert.ok(metric.roles[role.id], `Metric ${metric.id} must map role ${role.id}`);
      const status = metric.roles[role.id].status;
      assert.ok(["Mandated", "Optional", "N/A"].includes(status), `Invalid role status ${status} for ${role.id} in ${metric.id}`);
      assert.ok(metric.roles[role.id].reason, `Role ${role.id} in ${metric.id} must have a rationale`);
    });

    // Gadgets
    assert.ok(Array.isArray(metric.recommendedGadgets) && metric.recommendedGadgets.length > 0, `Metric ${metric.id} must recommend at least 1 gadget`);
  });
});

test("JQL Interpolation: Replaces parameters accurately", () => {
  const template = 'project = "{{projectKey}}" AND sprint in openSprints() AND board = {{boardId}} AND date >= -{{dateWindowDays}}d';
  const result = interpolateJql(template, {
    projectKey: "ENG",
    boardId: "42",
    dateWindowDays: 14
  });

  assert.strictEqual(result, 'project = "ENG" AND sprint in openSprints() AND board = 42 AND date >= -14d');
});

test("JQL Generation: Generates dual Cloud and DC queries", () => {
  const metric = METRICS[0];
  const generated = generateMetricJql(metric, { projectKey: "ALPHA", boardId: "99" });

  assert.strictEqual(generated.metricId, metric.id);
  assert.ok(generated.cloudJql.includes("ALPHA"));
  assert.ok(generated.dataCenterJql.includes("ALPHA"));
  assert.ok(generated.recommendedGadgets.length > 0);
});

test("Filtering: Filters by Role and Mandate status", () => {
  // Scrum Master mandated metrics
  const smMandated = getFilteredMetrics({ role: "scrum-master", mandate: "mandated" });
  assert.ok(smMandated.length > 0, "Scrum Master should have mandated metrics");
  smMandated.forEach(m => {
    assert.strictEqual(m.roles["scrum-master"].status, "Mandated");
  });

  // Product Owner mandated metrics
  const poMandated = getFilteredMetrics({ role: "product-owner", mandate: "mandated" });
  assert.ok(poMandated.length > 0, "Product Owner should have mandated metrics");
  poMandated.forEach(m => {
    assert.strictEqual(m.roles["product-owner"].status, "Mandated");
  });

  // QA mandated metrics
  const qaMandated = getFilteredMetrics({ role: "qa-tester", mandate: "mandated" });
  assert.ok(qaMandated.length > 0, "QA should have mandated metrics");
  qaMandated.forEach(m => {
    assert.strictEqual(m.roles["qa-tester"].status, "Mandated");
  });
});

test("Filtering: Filters by Framework", () => {
  const scrumMetrics = getFilteredMetrics({ framework: "scrum" });
  assert.ok(scrumMetrics.length > 0);
  scrumMetrics.forEach(m => {
    assert.ok(m.framework === "Scrum" || m.framework === "Hybrid");
  });

  const kanbanMetrics = getFilteredMetrics({ framework: "kanban" });
  assert.ok(kanbanMetrics.length > 0);
  kanbanMetrics.forEach(m => {
    assert.ok(m.framework === "Kanban" || m.framework === "Hybrid");
  });

  const doraMetrics = getFilteredMetrics({ framework: "dora" });
  assert.strictEqual(doraMetrics.length, 5, "Should have 5 DORA metrics defined");
  doraMetrics.forEach(m => {
    assert.ok(m.framework === "DORA");
    assert.ok(m.name.includes("DORA"));
  });

  const secMetrics = getFilteredMetrics({ framework: "devsecops" });
  assert.strictEqual(secMetrics.length, 6, "Should have 6 DevSecOps metrics defined");
  secMetrics.forEach(m => {
    assert.ok(m.framework === "DevSecOps");
    assert.ok(m.name.includes("DevSecOps") || m.name.includes("Cybersecurity"));
  });
});

test("Search: Text search across metric name and JQL", () => {
  const searchResults = getFilteredMetrics({ search: "burndown" });
  assert.ok(searchResults.length > 0);
  searchResults.forEach(m => {
    const text = `${m.name} ${m.purpose} ${m.category} ${m.cloudJql}`.toLowerCase();
    assert.ok(text.includes("burndown"));
  });
});

test("Dashboard Blueprint: Generates structured blueprint for Role with Mandated first", () => {
  const blueprint = getDashboardBlueprint("scrum-master", "cloud", { projectKey: "SAFE", boardId: "201" });

  assert.strictEqual(blueprint.roleId, "scrum-master");
  assert.strictEqual(blueprint.environment, "Jira Cloud");
  assert.ok(blueprint.mandatedGadgets > 0);
  assert.ok(blueprint.widgets.length > 0);

  // Check ordering: all mandated widgets come before optional widgets
  let foundOptional = false;
  blueprint.widgets.forEach(w => {
    if (w.governanceStatus === "Optional") {
      foundOptional = true;
    }
    if (w.governanceStatus === "Mandated") {
      assert.strictEqual(foundOptional, false, "Mandated widgets must appear before Optional widgets in blueprint");
    }
  });
});

test("Roles Summary: Returns all roles with accurate counts", () => {
  const summary = getRolesSummary();
  assert.strictEqual(summary.length, ROLES.length);

  summary.forEach(role => {
    assert.ok(role.mandatedCount >= 3, `${role.name} should have at least 3 mandated metrics`);
    assert.ok(role.totalCount >= role.mandatedCount);
  });
});
