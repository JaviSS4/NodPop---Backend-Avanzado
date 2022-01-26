"use strict";

const mongoose = require("mongoose");

//esquema
const usuarioSchema = mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
});

//modelo
const Usuario = mongoose.model("Usuario", usuarioSchema);

//exportar modelo
module.exports = Usuario;
