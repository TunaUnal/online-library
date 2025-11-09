import User from "../models/UserModel.js";
import File from "../models/FileModel.js";
import Notification from "../models/NotificationModel.js";
const getDashboardData = async (userId) => {
  try {
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    const fileCount = await File.count({ where: { status: "approved" } });
    const userCount = await User.count();
    const userFileCount = await File.count({
      where: { user_id: userId, status: "approved" },
    });
    const userDownloadedFileCount = await File.sum("hit", {
      where: { user_id: userId },
    });
    // Örnek veri
    const data = {
      filesUploaded: userFileCount,
      totalUsers: userCount,
      totalFiles: fileCount,
      donwloadedFiles: userDownloadedFileCount,
    };
    return data;
  } catch (error) {
    throw new Error("Dashboard verileri alınamadı: " + error.message);
  }
};

const markAsRead = async (req) => {
  try {
    const notification = req.record; //? Kayıt, sahipliği doğrulanmış bir şekilde middleware'den geldi
    await notification.update({ is_read: true });
    return notification;
  } catch (error) {
    throw new Error("Bildirim okundu işaretlenemedi: " + error.message);
  }
};

export const mainService = {
  getDashboardData,
  markAsRead,
};
