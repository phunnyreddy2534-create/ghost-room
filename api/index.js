export default function handler(req, res) {
  res.status(200).json({
    status: "ok",
    message: "Ghost Room API is running",
    time: new Date().toISOString()
  });
}
