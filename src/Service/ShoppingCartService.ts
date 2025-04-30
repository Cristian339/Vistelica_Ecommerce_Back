import { AppDataSource } from '../Config/database';
import { Order } from '../Entities/Order';
import { User } from '../Entities/User';
import {ShoppingCartDetailService} from "./ShoppingCartDetailService";

export class ShoppingCartService {
    private orderRepository = AppDataSource.getRepository(Order);
    private userRepository = AppDataSource.getRepository(User);

    async createOrder(userId?: number, sessionId?: string): Promise<Order | null> {
        try {
            let user: User | null = null;

            if (userId) {
                user = await this.userRepository.findOneBy({ user_id: userId });

                if (!user) {
                    throw new Error("Usuario no encontrado.");
                }
            }

            // Validar que al menos uno de los dos valores esté presente
            if (!user && !sessionId) {
                throw new Error("Debe proporcionarse un userId o un sessionId para crear una orden.");
            }

            const order = this.orderRepository.create({
                user: user || undefined, // Si no hay usuario, será null
                status: "en carro",
                session_id: sessionId || undefined, // Si no hay sessionId, será null
            });

            return await this.orderRepository.save(order);

        } catch (error) {
            console.error("Error al crear el pedido:", error);
            throw new Error("Error al crear el pedido");
        }
    }

    async countCartItems(userId?: number, sessionId?: string): Promise<number> {
        try {
            // Validar que al menos uno de los dos valores esté presente
            if (!userId && !sessionId) {
                throw new Error("Debe proporcionarse un userId o un sessionId para contar los productos.");
            }

            let order: Order | null = null;

            if (userId) {
                // Buscar carrito por usuario
                order = await this.orderRepository.findOne({
                    where: {
                        user: { user_id: userId },
                        status: "Carrito"
                    },
                    relations: ["orderDetails"]
                });
            } else if (sessionId) {
                // Buscar carrito por sesión
                order = await this.orderRepository.findOne({
                    where: {
                        session_id: sessionId,
                        status: "Carrito"
                    },
                    relations: ["orderDetails"]
                });
            }

            // Si no se encuentra el carrito, retornar 0
            if (!order) {
                return 0;
            }

            // Contar la cantidad total de items sumando las cantidades
            const itemCount = order.orderDetails?.reduce((total, detail) => {
                return total + detail.quantity;
            }, 0) || 0;

            return itemCount;

        } catch (error) {
            console.error('Error al contar productos del carrito:', error);
            throw new Error('Error al contar productos del carrito');
        }
    }

    async getOrderByUserId(userId: number): Promise<Order | null> {
        try {
            return await this.orderRepository.findOne({
                where: {
                    user: { user_id: userId },
                    status: "Carrito"
                },
                relations: ["orderDetails", "orderDetails.product"],
            });
        } catch (error) {
            console.error('Error al obtener el pedido por ID de usuario:', error);
            throw new Error('Error al obtener el pedido por ID de usuario');
        }
    }

    async getOrderById(orderId: number): Promise<Order | null> {
        try {
            const order = await this.orderRepository.findOne({
                where: { order_id: orderId,
                    status: "Carrito"
                },
                relations: ["user", "orderDetails"],
            });
            if (!order) {
                throw new Error('Pedido no encontrado');
            }
            return order;
        } catch (error) {
            console.error('Error al obtener el pedido por ID:', error);
            throw new Error('Error al obtener el pedido por ID');
        }
    }

    async getOrderBySessionId(sessionId: string): Promise<Order | null> {
        try {
            return await this.orderRepository.findOne({
                where: {
                    session_id: sessionId,
                    status: "Carrito"
                },
                relations: ["orderDetails", "orderDetails.product"],
            });
        } catch (error) {
            console.error('Error al obtener el pedido por ID de sesión:', error);
            throw new Error('Error al obtener el pedido por ID de sesión');
        }
    }

    async associateOrderToUser(orderId: number, userId: number): Promise<Order> {
        try {
            const order = await this.orderRepository.findOneBy({ order_id: orderId });
            if (!order) {
                throw new Error('Pedido no encontrado');
            }

            const user = await this.userRepository.findOneBy({ user_id: userId });
            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            // Verificar si el usuario ya tiene un pedido en carrito
            const existingUserOrder = await this.orderRepository.findOne({
                where: {
                    user: { user_id: userId },
                    status: "Carrito"
                }
            });

            const shoppingCartDetailService = new ShoppingCartDetailService();

            if (existingUserOrder) {
                // Si el usuario ya tiene un pedido, transferir los detalles
                await shoppingCartDetailService.transferOrderDetails(orderId, existingUserOrder.order_id);

                // Eliminar el pedido antiguo (el de la sesión)
                await this.orderRepository.delete(orderId);

                // Retornar el pedido existente del usuario
                return existingUserOrder;
            } else {
                // Si el usuario no tiene pedido, asociar este pedido al usuario
                order.user = user;
                order.session_id = null;
                return await this.orderRepository.save(order);
            }
        } catch (error) {
            console.error('Error al asociar pedido al usuario:', error);
            throw new Error('Error al asociar pedido al usuario');
        }
    }

    async updateOrderStatus(orderId: number, status: string): Promise<Order> {
        try {
            const order = await this.orderRepository.findOneBy({ order_id: orderId });
            if (!order) {
                throw new Error('Pedido no encontrado');
            }
            order.status = status;
            return await this.orderRepository.save(order);
        } catch (error) {
            console.error('Error al actualizar el estado del pedido:', error);
            throw new Error('Error al actualizar el estado del pedido');
        }
    }

    async deleteOrder(orderId: number): Promise<Order> {
        try {
            const order = await this.orderRepository.findOneBy({ order_id: orderId });
            if (!order) {
                throw new Error('Pedido no encontrado');
            }
            await this.orderRepository.delete(orderId);
            return order;
        } catch (error) {
            console.error('Error al eliminar el pedido:', error);
            throw new Error('Error al eliminar el pedido');
        }
    }
}