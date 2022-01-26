"use strict";

module.exports = (req, res, next) => {
  if (!req.session.usuarioLogado) {
    res.redirect("/login");
    return;
  }
  next();
};
