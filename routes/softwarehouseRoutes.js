const express = require("express");
const {
  getSofthouse,
  getSofthouseStatus,
  getProfile,
  addSofthouse,
  updateSofthouse,
  updateStatus,
  deleteSofthouse,
  getSoftwarehouse,
} = require("../controllers/softwarehouseController");
const router = express.Router();

router.get("/", getSofthouse);
router.get("/byid/:id", getSofthouseStatus);
router.get("/profile/:email", getProfile);
router.post("/", addSofthouse);
router.put("/:id", updateSofthouse);
router.patch("/:id", updateSofthouse);
router.put("/status/:id", updateStatus);
router.delete("/:id", deleteSofthouse);
router.get("/:id",getSoftwarehouse);

module.exports = router;
