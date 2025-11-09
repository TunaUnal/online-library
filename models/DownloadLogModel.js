import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const DownloadLog = sequelize.define(
  "DownloadLog",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    file_id: { type: DataTypes.INTEGER, allowNull: false },
    downloaded_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  { tableName: "file_downloads", timestamps: false }
);

export default DownloadLog;
