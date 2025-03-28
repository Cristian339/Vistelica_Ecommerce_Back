import { Request, Response } from 'express';
import { NotificationService } from '../Service/NotificationService';
import { User } from '../Entities/User';
import AppDataSource from "../Config/database";

export class NotificationController {
    private notificationService = new NotificationService();
    private userRepository = AppDataSource.getRepository(User);

    constructor() {
        this.getUnreadNotifications = this.getUnreadNotifications.bind(this);
        this.getReadNotifications = this.getReadNotifications.bind(this);
        this.markNotificationAsRead = this.markNotificationAsRead.bind(this);
        this.notifyNewGarment = this.notifyNewGarment.bind(this);
        this.notifyOrderStatusChange = this.notifyOrderStatusChange.bind(this);
    }

    async getUnreadNotifications(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const notifications = await this.notificationService.getUserNotificationsUnRead(Number(userId));
            res.status(200).json(notifications);
        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al obtener notificaciones no leídas'
            });
        }
    }

    async getReadNotifications(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const notifications = await this.notificationService.getUserNotificationsRead(Number(userId));
            res.status(200).json(notifications);
        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al obtener notificaciones leídas'
            });
        }
    }

    async markNotificationAsRead(req: Request, res: Response): Promise<void> {
        try {
            const { notificationId } = req.params;
            const notification = await this.notificationService.markAsRead(Number(notificationId));

            if (!notification) {
                res.status(404).json({
                    mensaje: 'Notificación no encontrada'
                });
                return;
            }

            res.status(200).json({
                mensaje: 'Notificación marcada como leída',
                notification
            });
        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al marcar notificación como leída'
            });
        }
    }

    async notifyNewGarment(req: Request, res: Response): Promise<void> {
        try {
            const { userId, garmentName } = req.body;

            const user = await this.userRepository.findOneBy({ user_id: userId });

            if (!user) {
                res.status(404).json({
                    mensaje: 'Usuario no encontrado'
                });
                return;
            }

            const notification = await this.notificationService.notifyNewGarmentAdded(user, garmentName);
            res.status(201).json({
                mensaje: 'Notificación creada exitosamente',
                notification
            });
        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al crear notificación de nueva prenda'
            });
        }
    }


    async notifyNewOrder(req: Request, res: Response): Promise<void> {
        try {
            const { userId, orderId } = req.body;

            // Buscar usuario en base de datos
            const user = await this.userRepository.findOneBy({ user_id: userId });

            if (!user) {
                res.status(404).json({ mensaje: 'Usuario no encontrado' });
                return;
            }

            const notification = await this.notificationService.notifyNewOrder(user, orderId);

            res.status(201).json({
                mensaje: 'Notificación de nuevo pedido creada',
                notification
            });
        } catch (error) {
            console.error('Error en notifyNewOrder:', error);
            res.status(500).json({
                mensaje: 'Error al crear notificación de nuevo pedido'
            });
        }
    }

    async notifyOrderStatusChange(req: Request, res: Response): Promise<void> {
        try {
            const { userId, orderId, oldStatus, newStatus } = req.body;

            const user = await this.userRepository.findOneBy({ user_id: userId });

            if (!user) {
                res.status(404).json({
                    mensaje: 'Usuario no encontrado'
                });
                return;
            }

            const notification = await this.notificationService.notifyOrderStatusChange(
                user,
                orderId,
                oldStatus,
                newStatus
            );

            res.status(201).json({
                mensaje: 'Notificación de cambio de estado creada',
                notification
            });
        } catch (error) {
            res.status(500).json({
                mensaje: 'Error al crear notificación de cambio de estado'
            });
        }
    }
}