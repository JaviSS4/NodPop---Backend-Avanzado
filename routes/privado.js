const express = require("express");
const router = express.Router();

// get /privado

router.get("/", (req, res, next) => {
  res.render("privado");
});

module.exports = router;
