import fs from "fs";
import path from "path";
import LogModel from "../models/LogModel.js";

const LOG_DIR = path.resolve("logs");

// Eğer klasör yoksa oluştur
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

class LogService {
  /**
   * Genel log oluşturma metodu
   * @param {Object} options
   * @param {Request} [options.req] Express isteği (isteğe bağlı)
   * @param {string} options.action Log başlığı (örnek: "file.uploaded")
   * @param {string} [options.detail] Ek açıklama
   * @param {string} [options.status] info | warning | error | success
   * @param {number} [options.user_id] Manuel user_id
   */
  static async create({ req, action, detail, status = "info", user_id }) {
    try {
      // IP adresi al
      const ip =
        req?.headers["x-forwarded-for"]?.split(",")[0] ||
        req?.socket?.remoteAddress ||
        null;

      // Kullanıcı kimliği al
      const userId = req?.user?.id || user_id || null;
      const userName = req?.user?.username || null;

      // --- 1️⃣ Veritabanına yaz ---
      await LogModel.create({
        user_id: userId,
        ip,
        action,
        detail,
        status,
      });

      // --- 2️⃣ Dosyaya yaz ---
      const filePath = path.join(
        LOG_DIR,
        `${new Date().toISOString().slice(0, 10)}.log`
      );

      const line = `[${new Date().toISOString()}] [${status.toUpperCase()}] [user:${
        userId ?? "anon"
      } - ${userName}] [ip:${ip ?? "?"}] ${action} - ${detail || ""}\n`;

      fs.appendFileSync(filePath, line, "utf8");

      return true;
    } catch (err) {
      console.error("❌ LogService.create hata:", err.message);
      return false;
    }
  }

  /**
   * Yalnızca dosyaya log yazar
   */
  static writeToFile(message, status = "info") {
    const filePath = path.join(
      LOG_DIR,
      `${new Date().toISOString().slice(0, 10)}.log`
    );
    const line = `[${new Date().toISOString()}] [${status.toUpperCase()}] ${message}\n`;
    fs.appendFileSync(filePath, line, "utf8");
  }
}

export default LogService;
