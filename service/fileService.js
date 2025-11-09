import FileModel from "../models/FileModel.js";
import UserModel from "../models/UserModel.js";
import CategoryModel from "../models/CategoryModel.js";
import NotificationModel from "../models/NotificationModel.js";
import DownloadLog from "../models/DownloadLogModel.js";
import { Op } from "sequelize";
import fs from "fs";
import mime from "mime-types"; // Kütüphaneyi import et
import path from "path";
import eventEmitter from "../utils/eventEmitter.js";
import {
  flattenSequelizeRelations,
  excludeKeys,
  pickKeys,
} from "../utils/object.js";
import { runInNewContext } from "vm";
const getFileById = async (id) => {
  if (!id) {
    throw new Error("ID zorunludur.");
  }
  const file = await FileModel.findByPk(id);
  if (!file) {
    throw new Error("Dosya bulunamadı.");
  }
  return file;
};

const getFilesByFilter = async (queryParams = {}, options = {}) => {
  const {
    filter = {},
    page = 1,
    limit = 20,
    sort = "id",
    order = "DESC",
  } = queryParams;

  const {
    includeUser = false,
    includeCategory = false,
    removeKeys = [],
  } = options;

  // Gelen sayfa ve limit değerlerinin sayı olduğundan emin oluyoruz.
  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);
  // Sayfalama için 'offset' değerini hesaplıyoruz.
  // Örn: 2. sayfadaysan ve limit 20 ise, ilk 20 kaydı atlaman gerekir. offset = (2-1)*20 = 20.
  const offset = (parsedPage - 1) * parsedLimit;

  const sequelizeQuery = {
    where: filter, // URL'den gelen filtre objesi: { status: 'approved', user_id: '5' }
    limit: parsedLimit, // Sayfa başına kaç kayıt getirileceği
    offset: offset, // Kaç kayıt atlanacağı
    order: [
      [sort, order], // Sıralama. örn: [['createdAt', 'DESC']]
    ],
  };
  sequelizeQuery.include = [];
  if (includeUser) {
    sequelizeQuery.include.push({
      model: UserModel,
      as: "user", // Model tanımınızdaki ilişki adıyla eşleşmeli
      attributes: ["name"], // Sadece istediğimiz alanları alalım
    });
  }
  if (includeCategory) {
    sequelizeQuery.include.push({
      model: CategoryModel,
      as: "category", // Model tanımınızdaki ilişki adıyla eşleşmeli
      attributes: ["name"], // Sadece istediğimiz alanları alalım
    });
  }
  const { count, rows } = await FileModel.findAndCountAll(sequelizeQuery);
  console.log("roes");
  const flattenedData = excludeKeys(
    flattenSequelizeRelations(rows),
    removeKeys
  );

  // 3. ADIM: Yanıt için Veriyi ve Sayfalama Bilgilerini Hazırlama

  // Toplam sayfa sayısını hesaplıyoruz.
  const totalPages = Math.ceil(count / parsedLimit);

  return {
    data: flattenedData, // O sayfadaki veriler
    pagination: {
      totalItems: count, // Filtreye uyan toplam öğe sayısı
      totalPages: totalPages, // Toplam sayfa sayısı
      currentPage: parsedPage, // Mevcut sayfa
      limit: parsedLimit, // Sayfa başına limit
    },
  };
};

const updateFile = async (id, updateData) => {
  const file = await FileModel.findByPk(id);
  console.log(updateData);
  if (file) {
    await file.update(updateData);
    return file;
  }
  return null;
};

export const changeFileStatus = async (req) => {
  const { id } = req.params;
  const { status } = req.body;
  console.log(req);
  const file = await FileModel.findByPk(id);
  if (!file) {
    throw new Error("Dosya bulunamadı");
  }
  await file.update({ status });

  //! Log kaydı tutmak ve notification yayınlamak için file'ı requeste ekleyip gönderdim.
  req.file = file;

  eventEmitter.emit(
    status == "approved" ? "file.approved" : "file.rejected",
    req
  );

  return file;
};

const downloadFile = async (req) => {
  const { id } = req.params;
  const file = await FileModel.findByPk(id);
  if (!file) throw new Error("Dosya Bulunamadı");

  const filePath = file.path; // Dosyanın sunucudaki tam yolu

  // Dosya uzantısından MIME türünü bul
  const mimeType = mime.lookup(file.ext) || "application/octet-stream";

  const fileStream = fs.createReadStream(filePath);

  if (file.user_id === req.user.id) {
    console.log("Kullanıcı kendi dosyasını indirdi, hit artmıyor.");
  } else {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const alreadyDownloaded = await DownloadLog.findOne({
      where: {
        user_id: req.user.id,
        file_id: id,
        downloaded_at: { [Op.gt]: oneWeekAgo },
      },
    });

    if (!alreadyDownloaded) {
      // Hit artır
      await file.update({ hit: file.hit + 1 });
      await DownloadLog.create({ user_id: req.user.id, file_id: id });
    } else {
      console.log("Bu dosya zaten bu hafta indirildi, hit artmıyor.");
    }
  }
  return {
    stream: fileStream,
    filename: `${file.filename}.${file.ext}`,
    mimeType: mimeType, // MIME türünü de controller'a gönder
  };
};

const uploadFile = async (req) => {
  const { user, file, body } = req;
  const ext = path.extname(file.originalname).replace(".", ""); // ör: "pdf"
  const userId = user.id;
  const filename = body.filename;
  const category_id = body.category_id;
  const newFile = await FileModel.create({
    filename: filename,
    stored_name: file.filename,
    ext: ext,
    path: file.path,
    size: file.size,
    mimetype: file.mimetype,
    user_id: userId,
    uploaded_at: Date.now(),
    category_id: category_id,
  });
  eventEmitter.emit("file.uploaded", req);
  return newFile;
};

export default {
  uploadFile,
  getFileById,
  getFilesByFilter,
  updateFile,
  changeFileStatus,
  downloadFile,
  uploadFile,
};
