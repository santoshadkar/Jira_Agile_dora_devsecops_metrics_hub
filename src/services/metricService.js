// Metric Business Logic and Blueprint Generation Service
const { METRICS } = require("../data/metricsData");
const { ROLES } = require("../data/rolesData");
const { GADGETS } = require("../data/gadgetsData");
const { generateMetricJql, interpolateJql } = require("./jqlService");

/**
 * Filter metrics by framework, role, mandate, and text search
 */
function getFilteredMetrics({ framework = "all", role = "all", mandate = "all", search = "" } = {}) {
  const normalizedSearch = search.trim().toLowerCase();

  return METRICS.filter(metric => {
    // Framework filter
    if (framework !== "all") {
      const f = framework.toLowerCase();
      const mf = metric.framework.toLowerCase();
      if (f === "dora") {
        if (mf !== "dora") return false;
      } else if (f === "devsecops") {
        if (mf !== "devsecops") return false;
      } else {
        if (mf !== f && mf !== "hybrid") return false;
      }
    }

    // Role filter
    if (role !== "all") {
      const roleConfig = metric.roles[role];
      if (!roleConfig || roleConfig.status === "N/A") {
        return false;
      }

      // Mandate filter (within selected role)
      if (mandate === "mandated" && roleConfig.status !== "Mandated") {
        return false;
      }
      if (mandate === "optional" && roleConfig.status !== "Optional") {
        return false;
      }
    } else if (mandate !== "all") {
      // If no specific role selected, check if ANY role has this mandate status
      const hasMandate = Object.values(metric.roles).some(r =>
        mandate === "mandated" ? r.status === "Mandated" : r.status === "Optional"
      );
      if (!hasMandate) return false;
    }

    // Search query
    if (normalizedSearch) {
      const haystack = `${metric.name} ${metric.purpose} ${metric.category} ${metric.framework} ${metric.cloudJql} ${metric.dataCenterJql}`.toLowerCase();
      if (!haystack.includes(normalizedSearch)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Retrieve metric by ID
 */
function getMetricById(id) {
  return METRICS.find(m => m.id === id) || null;
}

/**
 * Summarize metrics governance across all roles
 */
function getRolesSummary() {
  return ROLES.map(role => {
    let mandatedCount = 0;
    let optionalCount = 0;

    METRICS.forEach(metric => {
      const roleSetting = metric.roles[role.id];
      if (roleSetting) {
        if (roleSetting.status === "Mandated") mandatedCount++;
        if (roleSetting.status === "Optional") optionalCount++;
      }
    });

    return {
      ...role,
      mandatedCount,
      optionalCount,
      totalCount: mandatedCount + optionalCount
    };
  });
}

/**
 * Generates an end-to-end Dashboard Blueprint for a specific Agile Role
 */
function getDashboardBlueprint(roleId, environment = "cloud", params = {}) {
  const role = ROLES.find(r => r.id === roleId);
  if (!role) {
    throw new Error(`Role not found: ${roleId}`);
  }

  const roleMetrics = METRICS.filter(metric => {
    const config = metric.roles[roleId];
    return config && (config.status === "Mandated" || config.status === "Optional");
  });

  // Sort: Mandated first, then Optional
  roleMetrics.sort((a, b) => {
    const statusA = a.roles[roleId].status;
    const statusB = b.roles[roleId].status;
    if (statusA === "Mandated" && statusB !== "Mandated") return -1;
    if (statusA !== "Mandated" && statusB === "Mandated") return 1;
    return a.name.localeCompare(b.name);
  });

  const isCloud = environment.toLowerCase() !== "datacenter";

  const widgets = roleMetrics.map(metric => {
    const roleInfo = metric.roles[roleId];
    const generated = generateMetricJql(metric, params);
    const jql = isCloud ? generated.cloudJql : generated.dataCenterJql;
    const firstGadget = (metric.recommendedGadgets && metric.recommendedGadgets[0]) || {
      name: "Filter Results",
      type: "Table List",
      dimensions: "1/2 Column",
      configuration: "Display standard issue columns"
    };

    return {
      metricId: metric.id,
      metricName: metric.name,
      category: metric.category,
      framework: metric.framework,
      governanceStatus: roleInfo.status,
      governanceReason: roleInfo.reason,
      recommendedGadget: firstGadget.name,
      gadgetType: firstGadget.type,
      gadgetDimensions: firstGadget.dimensions,
      filterJql: jql,
      gadgetConfig: firstGadget.configuration,
      benchmark: metric.benchmark
    };
  });

  return {
    roleId: role.id,
    roleName: role.name,
    environment: isCloud ? "Jira Cloud" : "Jira Data Center",
    dashboardTitle: `${role.name} - Executive Agile Health Dashboard (${isCloud ? "Cloud" : "Data Center"})`,
    suggestedLayout: "Two Equal Columns (50% / 50%)",
    totalGadgets: widgets.length,
    mandatedGadgets: widgets.filter(w => w.governanceStatus === "Mandated").length,
    optionalGadgets: widgets.filter(w => w.governanceStatus === "Optional").length,
    setupInstructions: [
      `1. Log into your ${isCloud ? "Jira Cloud" : "Jira Data Center"} instance.`,
      `2. Navigate to Dashboards -> 'Create Dashboard'.`,
      `3. Name the dashboard: '${role.name} - Agile Observability Hub' and share with your Project / Team.`,
      `4. Set layout to 'Two Equal Columns'.`,
      `5. For each metric below marked [MANDATED], save the provided JQL as a shared Jira Filter, add the designated Gadget, and bind the Filter.`,
      `6. Configure refresh intervals to 15 minutes for real-time standup inspection.`
    ],
    widgets
  };
}

module.exports = {
  getFilteredMetrics,
  getMetricById,
  getRolesSummary,
  getDashboardBlueprint,
  METRICS,
  ROLES,
  GADGETS
};
