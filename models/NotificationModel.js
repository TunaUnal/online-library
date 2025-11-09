import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js"; // senin Sequelize bağlantın

const NotificationModel = sequelize.define(
  "Notification",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    link: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    type: {
      type: DataTypes.STRING(50),
      defaultValue: "info", // info, success, warning, error
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    related_file_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "notifications",
    timestamps: false, // created_at zaten var
  }
);

export default NotificationModel;
