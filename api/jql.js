const { getMetricById } = require("../src/services/metricService");
const { generateMetricJql } = require("../src/services/jqlService");

module.exports = (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const body = req.body || {};
  if (!body.metricId) {
    return res.status(400).json({ error: "metricId is required in request body" });
  }

  const metric = getMetricById(body.metricId);
  if (!metric) {
    return res.status(404).json({ error: `Metric not found: ${body.metricId}` });
  }

  const generated = generateMetricJql(metric, body);
  res.status(200).json(generated);
};
