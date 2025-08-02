"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class MKalenderPribadi extends Model {
  static get table() {
    return "m_kalender_pribadi";
  }

  // Relasi ke user jika ada model User
  user() {
    return this.belongsTo("App/Models/User", "user_id", "id");
  }
}

module.exports = MKalenderPribadi;
