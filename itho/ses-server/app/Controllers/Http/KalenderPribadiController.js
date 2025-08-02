"use strict";

const MKalenderPribadi = use("App/Models/MKalenderPribadi");

class KalenderPribadiController {
  // GET /kalender-pribadi
  async index({ auth, response }) {
    try {
      const user = await auth.getUser();
      const kalender = await MKalenderPribadi.query()
        .where("user_id", user.id)
        .fetch();
      return response.json(kalender);
    } catch (error) {
      return response.status(401).json({ message: "Unauthorized" });
    }
  }

  // POST /kalender-pribadi
  async store({ auth, request, response }) {
    try {
      const user = await auth.getUser();
      const data = request.only([
        "nama",
        "tanggal_awal",
        "tanggal_akhir",
        "deskripsi",
        "warna"
      ]);
      data.user_id = user.id;
      const kalender = await MKalenderPribadi.create(data);
      return response.status(201).json(kalender);
    } catch (error) {
      return response.status(401).json({ message: "Unauthorized" });
    }
  }

  // GET /kalender-pribadi/:id
  async show({ auth, params, response }) {
    try {
      const user = await auth.getUser();
      const kalender = await MKalenderPribadi.query()
        .where("user_id", user.id)
        .where("id", params.id)
        .first();
      if (!kalender) {
        return response.status(404).json({ message: "Not found" });
      }
      return response.json(kalender);
    } catch (error) {
      return response.status(401).json({ message: "Unauthorized" });
    }
  }

  // PUT /kalender-pribadi/:id
  async update({ auth, params, request, response }) {
    try {
      const user = await auth.getUser();
      const kalender = await MKalenderPribadi.query()
        .where("user_id", user.id)
        .where("id", params.id)
        .first();
      if (!kalender) {
        return response.status(404).json({ message: "Not found" });
      }
      const data = request.only([
        "nama",
        "tanggal_awal",
        "tanggal_akhir",
        "deskripsi",
        "warna"
      ]);
      kalender.merge(data);
      await kalender.save();
      return response.json(kalender);
    } catch (error) {
      return response.status(401).json({ message: "Unauthorized" });
    }
  }

  // DELETE /kalender-pribadi/:id
  async destroy({ auth, params, response }) {
    try {
      const user = await auth.getUser();
      const kalender = await MKalenderPribadi.query()
        .where("user_id", user.id)
        .where("id", params.id)
        .first();
      if (!kalender) {
        return response.status(404).json({ message: "Not found" });
      }
      await kalender.delete();
      return response.json({ message: "Deleted" });
    } catch (error) {
      return response.status(401).json({ message: "Unauthorized" });
    }
  }
}

module.exports = KalenderPribadiController;
