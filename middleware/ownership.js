// middlewares/ownershipMiddleware.js
import FileModel from "../models/FileModel.js";
import NotificationModel from "../models/NotificationModel.js";

const models = {
  file: FileModel,
  notification: NotificationModel,
};

/**
 * @param {string} modelName - Model adı (örnek: "file")
 * @param {string} paramKey - Parametre anahtarı (örnek: "id")
 */
export const checkOwnership = (modelName, paramKey = "id") => {
  return async (req, res, next) => {
    try {
      const Model = models[modelName];
      if (!Model) throw new Error("Model bulunamadı");

      const targetId = req.params[paramKey] || req.body[paramKey];
      const record = await Model.findByPk(targetId);
      if (!record) {
        return res.status(404).json({ error: "Kayıt bulunamadı" });
      }

      if (record.user_id !== req.user.id) {
        return res.status(403).json({
          error: "Bu işlem için yetkiniz yok",
        });
      }
      req.record = record; // istersen serviste tekrar çekmek zorunda kalmazsın
      next();
    } catch (err) {
      console.error("Ownership middleware hatası:", err.message);
      res.status(500).json({ error: "Sunucu hatası" });
    }
  };
};
