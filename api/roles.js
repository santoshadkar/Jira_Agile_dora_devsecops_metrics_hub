const { getRolesSummary } = require("../src/services/metricService");

module.exports = (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  res.status(200).json({
    roles: getRolesSummary()
  });
};
