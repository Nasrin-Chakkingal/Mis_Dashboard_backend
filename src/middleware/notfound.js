import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "../../dist");

export default (req, res, next) => {
  if (req.originalUrl.startsWith("/api")) {
    // API → JSON 404
    res.status(404).json({ error: "Not found" });
  } else {
    // React Router → serve index.html
    res.sendFile(path.join(distPath, "index.html"));
  }
};
