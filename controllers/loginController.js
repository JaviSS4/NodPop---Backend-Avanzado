"use strict";

const { Usuario } = require("../models");

class LoginController {
  index(req, res, next) {
    res.locals.error = "";
    res.render("login");
  }
  async post(req, res, next) {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ email });

    if (!usuario || !(await usuario.comparePassword(password))) {
      res.locals.error = "Invalid credentials";
      res.render("login");
      return;
    }

    req.session.usuarioLogado = {
      _id: usuario._id,
    };
    res.redirect("/privado");
  }
  catch(err) {
    next(err);
  }
}

module.exports = LoginController;
