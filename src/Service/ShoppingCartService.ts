import { AppDataSource } from '../Config/database'; // Asegúrate de importar la fuente de datos correcta
import { Order } from '../Entities/Order';
import { User } from '../Entities/User';
import {ShoppingCartDetailService} from "./ShoppingCartDetailService";



export class ShoppingCartService {
    // ... (código existente)
    private orderRepository = AppDataSource.getRepository(Order); // Repositorio de Order
    private userRepository = AppDataSource.getRepository(User);
    private orderDetailService = new ShoppingCartDetailService();
    // Crear un nuevo pedido (carrito) - ahora acepta sessionId para usuarios no autenticados
    async createOrder(userId?: number, sessionId?: string): Promise<Order> {
        try {
            let user: User | null = null;

            if (userId) {
                // Verificar si el usuario existe si se proporciona userId
                user = await this.userRepository.findOneBy({ user_id: userId });
                if (!user) {
                    throw new Error('User not found');
                }
            }

            // Crear el pedido

            const order = this.orderRepository.create({
                // @ts-ignore
                user,
                status: "en proceso",
                session_id: sessionId
            });

            // @ts-ignore
            return await this.orderRepository.save(order);
        } catch (error) {
            console.error('Error creating order:', error);
            throw new Error('Error creating order');
        }
    }

    async getOrderByUserId(userId: number): Promise<Order | null> {
        try {
            return await this.orderRepository.findOne({
                where: {
                    user: { user_id: userId },
                    status: "en proceso" // Solo carritos activos
                },
                relations: ["orderDetails", "orderDetails.product"],
            });
        } catch (error) {
            console.error('Error fetching order by user id:', error);
            throw new Error('Error fetching order by user id');
        }
    }

    // Obtener un pedido por su ID
    async getOrderById(orderId: number): Promise<Order | null> {
        try {
            const order = await this.orderRepository.findOne({
                where: { order_id: orderId },
                relations: ["user", "orderDetails"],
            });
            if (!order) {
                throw new Error('Order not found');
            }
            return order;
        } catch (error) {
            console.error('Error fetching order by id:', error);
            throw new Error('Error fetching order by id');
        }
    }


    // Obtener un pedido por sessionId (para usuarios no autenticados)
    async getOrderBySessionId(sessionId: string): Promise<Order | null> {
        try {
            return await this.orderRepository.findOne({
                where: {
                    session_id: sessionId,
                    status: "en proceso" // Solo carritos activos
                },
                relations: ["orderDetails", "orderDetails.product"],
            });
        } catch (error) {
            console.error('Error fetching order by session id:', error);
            throw new Error('Error fetching order by session id');
        }
    }

    // Asociar un carrito a un usuario cuando se registra o inicia sesión
    async associateOrderToUser(orderId: number, userId: number): Promise<Order> {
        try {
            const order = await this.orderRepository.findOneBy({ order_id: orderId });
            if (!order) {
                throw new Error('Order not found');
            }

            const user = await this.userRepository.findOneBy({ user_id: userId });
            if (!user) {
                throw new Error('User not found');
            }

            order.user = user;
            order.session_id = null; // Eliminar el session_id ya que ahora está asociado a un usuario

            return await this.orderRepository.save(order);
        } catch (error) {
            console.error('Error associating order to user:', error);
            throw new Error('Error associating order to user');
        }
    }


    // Actualizar el estado de un pedido
    async updateOrderStatus(orderId: number, status: string): Promise<Order> {
        try {
            const order = await this.orderRepository.findOneBy({ order_id: orderId });
            if (!order) {
                throw new Error('Order not found');
            }
            order.status = status;
            return await this.orderRepository.save(order);
        } catch (error) {
            console.error('Error updating order status:', error);
            throw new Error('Error updating order status');
        }
    }

    // Eliminar un pedido por su ID
    async deleteOrder(orderId: number): Promise<Order> {
        try {
            const order = await this.orderRepository.findOneBy({ order_id: orderId });
            if (!order) {
                throw new Error('Order not found');
            }
            await this.orderRepository.delete(orderId);
            return order;
        } catch (error) {
            console.error('Error deleting order:', error);
            throw new Error('Error deleting order');
        }
    }
}