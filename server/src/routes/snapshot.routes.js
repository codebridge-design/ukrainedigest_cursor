const express = require("express");
const { getSnapshot } = require("../controllers/snapshot.controller");

const router = express.Router();

// GET /api/snapshot?date=YYYY-MM-DD&country=UA&region=EUROPE
router.get("/", getSnapshot);

module.exports = router;
