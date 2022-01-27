"use strict";

const jwt = require("jsonwebtoken");
const { Usuario } = require("../models");

class LoginController {
  index(req, res, next) {
    res.locals.error = "";
    res.render("login");
  }
  async post(req, res, next) {
    try {
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
    } catch (err) {
      next(err);
    }
  }

  logout(req, res, next) {
    req.session.regenerate((err) => {
      if (err) {
        next(err);
        return;
      }
      res.redirect("/");
    });
  }
  async postJWT(req, res, next) {
    try {
      const { email, password } = req.body;
      const usuario = await Usuario.findOne({ email });

      if (!usuario || !(await usuario.comparePassword(password))) {
        res.json({ error: "Invalid credentials" });
        return;
      }
      jwt.sign(
        { _id: usuario._id },
        process.env.JWT_SECRET,
        {
          expiresIn: "2h",
        },
        (err, jwtToken) => {
          if (err) {
            next(err);
            return;
          }
          res.json({ token: jwtToken });
        }
      );
    } catch (err) {
      next();
    }
  }
}

module.exports = LoginController;
