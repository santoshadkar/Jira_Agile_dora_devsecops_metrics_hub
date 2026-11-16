// JQL Generation and Interpolation Service for Jira Cloud and Jira Data Center

/**
 * Replaces template placeholders in JQL strings with target parameters
 * @param {string} template - Raw JQL template
 * @param {object} params - Substitution parameters
 * @returns {string} - Interpolated JQL string
 */
function interpolateJql(template, params = {}) {
  if (!template) return "";

  const projectKey = (params.projectKey || "PROJ").trim().toUpperCase();
  const boardId = (params.boardId || "101").toString().trim();
  const sprintField = (params.sprintField || "Sprint").trim();
  const dateWindowDays = parseInt(params.dateWindowDays, 10) || 30;

  let result = template;
  result = result.replace(/\{\{projectKey\}\}/g, projectKey);
  result = result.replace(/\{\{boardId\}\}/g, boardId);
  result = result.replace(/\{\{sprintField\}\}/g, sprintField);
  result = result.replace(/\{\{dateWindowDays\}\}/g, dateWindowDays);

  return result;
}

/**
 * Generates both Cloud and Data Center customized queries and gadget instructions
 * @param {object} metric - Metric object
 * @param {object} params - User specified parameters
 * @returns {object} - Processed queries and gadget blueprints
 */
function generateMetricJql(metric, params = {}) {
  if (!metric) {
    throw new Error("Metric is required for JQL generation");
  }

  const cloudJql = interpolateJql(metric.cloudJql, params);
  const dataCenterJql = interpolateJql(metric.dataCenterJql, params);

  const interpolatedGadgets = (metric.recommendedGadgets || []).map(gadget => ({
    name: gadget.name,
    type: gadget.type,
    dimensions: gadget.dimensions,
    configuration: interpolateJql(gadget.configuration, params)
  }));

  return {
    metricId: metric.id,
    metricName: metric.name,
    category: metric.category,
    framework: metric.framework,
    cloudJql,
    dataCenterJql,
    cloudVsDcNotes: metric.cloudVsDcNotes || "",
    recommendedGadgets: interpolatedGadgets
  };
}

module.exports = {
  interpolateJql,
  generateMetricJql
};
