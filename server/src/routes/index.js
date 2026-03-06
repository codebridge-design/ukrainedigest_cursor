const express = require("express");
const snapshotRoutes = require("./snapshot.routes");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ ok: true, message: "Ukraine Digest API" });
});

router.use("/snapshot", snapshotRoutes);

module.exports = router;
