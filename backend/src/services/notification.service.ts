import { prisma } from '../prisma/client';
import { UserRole } from '@prisma/client';

type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

interface CreateNotificationParams {
  title: string;
  message: string;
  type?: NotificationType;
  entityType: string;
  entityId?: string;
  targetUserIds?: string[];
  targetRoles?: UserRole[];
}

export const notificationService = {
  async broadcast(params: CreateNotificationParams) {
    const { title, message, type = 'INFO', entityType, entityId, targetUserIds = [], targetRoles = [] } = params;

    const users = await prisma.user.findMany({
      where: {
        OR: [
          ...(targetRoles.length > 0 ? [{ role: { in: targetRoles } }] : []),
          ...(targetUserIds.length > 0 ? [{ id: { in: targetUserIds } }] : [])
        ]
      },
      select: { id: true }
    });

    // Admin receives all notifications
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true }
    });

    const allRecipients = Array.from(new Set([...users.map(u => u.id), ...admins.map(u => u.id)]));

    if (allRecipients.length === 0) return;

    await prisma.notification.createMany({
      data: allRecipients.map(userId => ({
        title,
        message,
        type,
        entityType,
        entityId,
        userId
      }))
    });
  },

  async getForUser(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to latest 50
    });
  },

  async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true }
    });
  },

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
  },

  async delete(id: string, userId: string) {
    return prisma.notification.deleteMany({
      where: { id, userId }
    });
  }
};
