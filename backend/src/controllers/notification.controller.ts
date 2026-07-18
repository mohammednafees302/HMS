import { Request, Response } from 'express';
import { notificationService } from '../services/notification.service';
import { AppError } from '../middleware/error.middleware';

export const notificationController = {
  async getNotifications(req: Request, res: Response) {
    const userId = req.user!.id;
    const notifications = await notificationService.getForUser(userId);
    res.json({ success: true, data: { notifications } });
  },

  async markAsRead(req: Request, res: Response) {
    const { id } = req.params;
    const userId = req.user!.id;
    const result = await notificationService.markAsRead(id, userId);
    if (result.count === 0) {
      throw new AppError(404, 'Notification not found or already read');
    }
    res.json({ success: true, message: 'Notification marked as read' });
  },

  async markAllAsRead(req: Request, res: Response) {
    const userId = req.user!.id;
    await notificationService.markAllAsRead(userId);
    res.json({ success: true, message: 'All notifications marked as read' });
  },

  async deleteNotification(req: Request, res: Response) {
    const { id } = req.params;
    const userId = req.user!.id;
    const result = await notificationService.delete(id, userId);
    if (result.count === 0) {
      throw new AppError(404, 'Notification not found');
    }
    res.json({ success: true, message: 'Notification deleted' });
  }
};
