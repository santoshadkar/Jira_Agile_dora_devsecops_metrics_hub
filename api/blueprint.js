const { getDashboardBlueprint } = require("../src/services/metricService");

module.exports = (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const { roleId, environment, projectKey, boardId } = req.query || {};
  if (!roleId) {
    return res.status(400).json({ error: "roleId query parameter is required" });
  }

  try {
    const blueprint = getDashboardBlueprint(roleId, environment || "cloud", { projectKey, boardId });
    res.status(200).json(blueprint);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
};
