import eventEmitter from "../utils/eventEmitter.js";
import LogService from "../service/logService.js";
import NotificationService from "../service/notificationService.js";

eventEmitter.on("file.uploaded", async (req) => {
  const { user, body, file } = req;
  await LogService.create({
    req,
    action: "File Upload",
    detail: `Kullanıcı ${body.filename} dosyasını yükledi.`,
    status: "INFO",
  });
});

eventEmitter.on("file.approved", async (req) => {
  const { user, body, file } = req;
  await LogService.create({
    req,
    action: "File Approved",
    detail: `Admin '${file.filename}[ID:${file.id}][userID:${file.user_id}]' dosyasını kabul etti.`,
    status: "INFO",
  });
  await NotificationService.create({
    user_id: file.user_id,
    title: "Paylaşımın yayınlandı!",
    message: `${file.filename} adlı dosyan onaylandı. Bunu paylaştığın için teşekkür ederiz`,
    type: "info",
  });
});

eventEmitter.on("file.rejected", async (req) => {
  const { user, body, file } = req;
  await LogService.create({
    req,
    action: "File Rejected",
    detail: `Admin '${file.filename}[ID:${file.id}][userID:${file.user_id}]' dosyasını reddetti.`,
    status: "INFO",
  });
  await NotificationService.create({
    user_id: file.user_id,
    title: "Paylaşımın reddedildi!",
    message: `${file.filename} adlı dosyan reddedildi. Dosyan 3 gün içinde sistemden tamamen silinecek.`,
    type: "error",
  });
});
