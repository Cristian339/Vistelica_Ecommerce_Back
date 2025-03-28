
import { Repository } from "typeorm";
import { AppDataSource } from "../Config/database";
import {Order} from "../Entities/Order";
import {Notification} from "../Entities/Notification";
import {User} from "../Entities/User";
export class NotificationService {
    private notificationRepository: Repository<Notification>;
    private userRepository: Repository<User>;

    constructor() {
        this.notificationRepository = AppDataSource.getRepository(Notification);
        this.userRepository = AppDataSource.getRepository(User);
    }


    //Crear notificación y guardar en el historial
    async createNotification(user: User, message: string, status: string = "unread"): Promise<Notification> {
        try {
            // Verificar que el usuario existe en la base de datos
            const dbUser = await this.userRepository.findOne({
                where: { user_id: user.user_id },
                relations: ['notifications']
            });

            if (!dbUser) {
                throw new Error(`Usuario con ID ${user.user_id} no encontrado`);
            }

            const notification = this.notificationRepository.create({
                user: dbUser,
                message,
                status
            });

            const savedNotification = await this.notificationRepository.save(notification);

            // Si necesitas mantener la relación bidireccional actualizada
            if (!dbUser.notifications) {
                dbUser.notifications = [];
            }
            dbUser.notifications.push(savedNotification);
            await this.userRepository.save(dbUser);

            return savedNotification;
        } catch (error) {
            console.error('Error en createNotification:', error);
            throw new Error('No se pudo crear la notificación');
        }
    }


    async notifyNewOrder(user: User, orderId: number): Promise<Notification> {
        try {
            if (!orderId || isNaN(orderId)) {
                throw new Error('ID de pedido inválido');
            }

            const message = `Se ha creado un nuevo pedido #${orderId}. ¡Gracias por tu compra!`;
            return await this.createNotification(user, message);
        } catch (error) {
            console.error('Error en notifyNewOrder:', error);
            throw new Error('No se pudo crear la notificación de nuevo pedido');
        }
    }


    async getUserNotificationsUnRead(userId: number): Promise<Notification[]> {
        return this.notificationRepository.find({
            where: { user: { user_id: userId },
                     status: "unread"},
            order: { created_at: 'DESC'},
        });
    }


    async getUserNotificationsRead(userId: number): Promise<Notification[]> {
        return this.notificationRepository.find({
            where: { user: { user_id: userId },
                     status: "read"},
            order: { created_at: 'DESC'},
        });
    }


    async notifyNewGarmentAdded(user: User, garmentName: string): Promise<Notification> {
        const message = `Se ha añadido una nueva prenda: ${garmentName}`;
        return this.createNotification(user, message);
    }

    async markAsRead(notificationId: number): Promise<Notification | null> {
        await this.notificationRepository.update(notificationId, { status: 'read' });
        return this.notificationRepository.findOneBy({ notification_id: notificationId });
    }


    async notifyOrderStatusChange(user: User, orderId: number, oldStatus: string, newStatus: string,): Promise<Notification> {
        const message = `El pedido #${orderId} ha cambiado de estado: de "${oldStatus}" a "${newStatus}"`;
        return this.createNotification(user, message);
    }

}