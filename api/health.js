module.exports = (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: "vercel-serverless",
    version: "1.0.0"
  });
};
