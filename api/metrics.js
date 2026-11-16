const { getFilteredMetrics, METRICS } = require("../src/services/metricService");

module.exports = (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const { framework, role, mandate, search } = req.query || {};
  const metrics = getFilteredMetrics({ framework, role, mandate, search });

  res.status(200).json({
    count: metrics.length,
    total: METRICS.length,
    metrics
  });
};
