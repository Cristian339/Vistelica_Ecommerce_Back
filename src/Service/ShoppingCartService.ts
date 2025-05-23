import { AppDataSource } from '../Config/database';
import { Cart } from '../Entities/Cart';
import { User } from '../Entities/User';
import { ShoppingCartDetailService } from "./ShoppingCartDetailService";

export class ShoppingCartService {
    private cartRepository = AppDataSource.getRepository(Cart);
    private userRepository = AppDataSource.getRepository(User);

    async createOrder(userId?: number, sessionId?: string): Promise<Cart | null> {
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

            const cart = this.cartRepository.create({
                user: user || undefined,
                status: "Carrito",
                session_id: sessionId || undefined,
            });

            return await this.cartRepository.save(cart);

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

            let cart: Cart | null = null;

            if (userId) {
                // Buscar carrito por usuario
                cart = await this.cartRepository.findOne({
                    where: {
                        user: { user_id: userId },
                        status: "Carrito"
                    },
                    relations: ["cartDetails"]
                });
            } else if (sessionId) {
                // Buscar carrito por sesión
                cart = await this.cartRepository.findOne({
                    where: {
                        session_id: sessionId,
                        status: "Carrito"
                    },
                    relations: ["cartDetails"]
                });
            }

            // Si no se encuentra el carrito, retornar 0
            if (!cart) {
                return 0;
            }

            // Contar la cantidad total de items sumando las cantidades
            const itemCount = cart.cartDetails?.reduce((total, detail) => {
                return total + detail.quantity;
            }, 0) || 0;

            return itemCount;

        } catch (error) {
            console.error('Error al contar productos del carrito:', error);
            throw new Error('Error al contar productos del carrito');
        }
    }

    async getOrderByUserId(userId: number): Promise<Cart | null> {
        try {
            return await this.cartRepository.findOne({
                where: {
                    user: { user_id: userId },
                    status: "Carrito"
                },
                relations: ["cartDetails", "cartDetails.product"],
            });
        } catch (error) {
            console.error('Error al obtener el pedido por ID de usuario:', error);
            throw new Error('Error al obtener el pedido por ID de usuario');
        }
    }

    async getOrderById(cartId: number): Promise<Cart | null> {
        try {
            const cart = await this.cartRepository.findOne({
                where: { cart_id: cartId, status: "Carrito" },
                relations: ["user", "cartDetails"],
            });
            if (!cart) {
                throw new Error('Pedido no encontrado');
            }
            return cart;
        } catch (error) {
            console.error('Error al obtener el pedido por ID:', error);
            throw new Error('Error al obtener el pedido por ID');
        }
    }

    async getOrderBySessionId(sessionId: string): Promise<Cart | null> {
        try {
            return await this.cartRepository.findOne({
                where: {
                    session_id: sessionId,
                    status: "Carrito"
                },
                relations: ["cartDetails", "cartDetails.product"],
            });
        } catch (error) {
            console.error('Error al obtener el pedido por ID de sesión:', error);
            throw new Error('Error al obtener el pedido por ID de sesión');
        }
    }

    async associateOrderToUser(cartId: number, userId: number): Promise<Cart> {
        try {
            const cart = await this.cartRepository.findOneBy({ cart_id: cartId });
            if (!cart) {
                throw new Error('Pedido no encontrado');
            }

            const user = await this.userRepository.findOneBy({ user_id: userId });
            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            // Verificar si el usuario ya tiene un pedido en carrito
            const existingUserCart = await this.cartRepository.findOne({
                where: {
                    user: { user_id: userId },
                    status: "Carrito"
                }
            });

            const shoppingCartDetailService = new ShoppingCartDetailService();

            if (existingUserCart) {
                // Si el usuario ya tiene un pedido, transferir los detalles
                await shoppingCartDetailService.transferOrderDetails(cartId, existingUserCart.cart_id);

                // Eliminar el pedido antiguo (el de la sesión)
                await this.cartRepository.delete(cartId);

                // Retornar el pedido existente del usuario
                return existingUserCart;
            } else {
                // Si el usuario no tiene pedido, asociar este pedido al usuario
                cart.user = user;
                cart.session_id = null;
                return await this.cartRepository.save(cart);
            }
        } catch (error) {
            console.error('Error al asociar pedido al usuario:', error);
            throw new Error('Error al asociar pedido al usuario');
        }
    }

    async updateOrderStatus(cartId: number, status: string): Promise<Cart> {
        try {
            const cart = await this.cartRepository.findOneBy({ cart_id: cartId });
            if (!cart) {
                throw new Error('Pedido no encontrado');
            }
            cart.status = status;
            return await this.cartRepository.save(cart);
        } catch (error) {
            console.error('Error al actualizar el estado del pedido:', error);
            throw new Error('Error al actualizar el estado del pedido');
        }
    }

    async deleteOrder(cartId: number): Promise<Cart> {
        try {
            const cart = await this.cartRepository.findOneBy({ cart_id: cartId });
            if (!cart) {
                throw new Error('Pedido no encontrado');
            }
            await this.cartRepository.delete(cartId);
            return cart;
        } catch (error) {
            console.error('Error al eliminar el pedido:', error);
            throw new Error('Error al eliminar el pedido');
        }
    }
}