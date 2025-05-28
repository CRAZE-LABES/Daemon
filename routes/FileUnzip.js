const express = require("express");
const fs = require("fs");
const path = require("path");
const unzipper = require("unzipper");

const router = express.Router();

// Example: POST /files/unzip/myfile.zip?path=/myfolder
router.post("/files/unzip/:file", async (req, res) => {
  const { file } = req.params;
  const extractPath = req.query.path || "/";

  // Safety: only allow extraction in specific root folder
  const rootDir = path.resolve("/srv/daemon-data"); // adjust to your data volume
  const targetDir = path.resolve(path.join(rootDir, extractPath));
  const zipFile = path.join(targetDir, file);

  // Security Check: Prevent path traversal
  if (!targetDir.startsWith(rootDir)) {
    return res.status(400).json({ error: "Invalid extraction path" });
  }

  try {
    if (!fs.existsSync(zipFile)) {
      return res.status(404).json({ error: "ZIP file not found" });
    }

    await fs.createReadStream(zipFile)
      .pipe(unzipper.Extract({ path: targetDir }))
      .promise();

    res.status(200).json({ success: true, message: "File extracted successfully" });
  } catch (err) {
    console.error("Unzip Error:", err);
    res.status(500).json({ error: "Failed to extract zip file" });
  }
});

module.exports = router;
