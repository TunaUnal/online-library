import { mainService } from "../service/mainService.js";
import NotificationService from "../service/NotificationService.js";

export const dashboard = async (req, res) => {
  try {
    const data = await mainService.getDashboardData(req.user.id);

    const notifications = await NotificationService.getUserNotifications(
      req.user.id
    );
    console.log(notifications);
    res
      .status(200)
      .json({ message: "Welcome to the Dashboard!", data, notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notification = mainService.markAsRead(req);
    res.status(200).json({ data: notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
