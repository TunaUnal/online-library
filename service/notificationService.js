import NotificationModel from "../models/NotificationModel.js";
import LogService from "./logService.js";

class NotificationService {
  /**
   * Yeni bildirim oluşturur.
   * @param {Object} options
   * @param {number} options.user_id - Bildirimi alacak kullanıcı
   * @param {string} options.title - Başlık
   * @param {string} options.message - Açıklama / içerik
   * @param {string} [options.type] - info | success | warning | error
   * @param {number} [options.related_file_id] - İlişkili dosya (isteğe bağlı)
   * @param {number} [options.related_user_id] - İlişkili kullanıcı (isteğe bağlı)
   * @param {number} [options.created_by] - Bildirimi oluşturan kişi (isteğe bağlı)
   */
  static async create({
    user_id,
    title,
    message,
    type = "info",
    related_file_id = null,
    related_user_id = null,
    created_by = null,
  }) {
    try {
      if (!user_id) throw new Error("user_id gerekli");

      const notification = await NotificationModel.create({
        user_id,
        title,
        message,
        type,
        related_file_id,
        related_user_id,
        created_by,
      });

      // Olayı logla
      await LogService.create({
        user_id: created_by,
        action: "notification.create",
        detail: `Bildirim oluşturuldu: ${title}`,
        status: "info",
      });

      return notification;
    } catch (err) {
      await LogService.create({
        user_id: created_by,
        action: "notification.error",
        detail: `Bildirim oluşturulamadı: ${err.message}`,
        status: "error",
      });
      console.error("❌ NotificationService.create hata:", err.message);
      return null;
    }
  }

  /**
   * Kullanıcının tüm bildirimlerini getirir.
   */
  static async getUserNotifications(user_id, options = {}) {
    try {
      return await NotificationModel.findAll({
        where: { user_id, is_read: false },
        order: [["created_at", "DESC"]],
        ...options,
      });
    } catch (err) {
      console.error(
        "❌ NotificationService.getUserNotifications hata:",
        err.message
      );
      return [];
    }
  }

  /**
   * Bildirimi okundu olarak işaretler.
   */
  static async markAsRead(notification_id) {
    try {
      const notif = await NotificationModel.findByPk(notification_id);
      if (!notif) return null;

      await notif.update({ is_read: true });

      await LogService.create({
        user_id: notif.user_id,
        action: "notification.read",
        detail: `Bildirim okundu: ${notif.title}`,
      });

      return notif;
    } catch (err) {
      console.error("❌ NotificationService.markAsRead hata:", err.message);
      return null;
    }
  }
}

export default NotificationService;
