import { AppDataSource } from '../Config/database';
import { OrderDetail } from '../Entities/OrderDetail';
import { Order } from '../Entities/Order';
import { Products } from '../Entities/Products';

export class ShoppingCartDetailService {

    private orderDetailRepository = AppDataSource.getRepository(OrderDetail);

    // Añadir un producto al carrito (OrderDetail)
    async addProductToOrder(orderId: number, productId: number, quantity: number, price: number): Promise<OrderDetail> {
        try {
            const order = { order_id: orderId } as Order;
            const product = { product_id: productId } as Products;
            const orderDetail = this.orderDetailRepository.create({
                order,
                product,
                quantity,
                price,
            });
            return await this.orderDetailRepository.save(orderDetail);
        } catch (error) {
            console.error('Error al agregar producto al pedido:', error);
            throw new Error('Error al agregar producto al pedido');
        }
    }

    // Eliminar un producto del carrito (OrderDetail)
    async removeProductFromOrder(orderDetailId: number): Promise<void> {
        try {
            const orderDetail = await this.orderDetailRepository.findOneBy({ order_detail_id: orderDetailId });
            if (!orderDetail) {
                throw new Error('Detalle de pedido no encontrado');
            }
            await this.orderDetailRepository.delete(orderDetailId);
        } catch (error) {
            console.error('Error al eliminar producto del pedido:', error);
            throw new Error('Error al eliminar producto del pedido');
        }
    }

    // Obtener los detalles de un pedido (OrderDetails)
    async getOrderDetails(orderId: number): Promise<OrderDetail[]> {
        try {
            const orderDetails = await this.orderDetailRepository.find({
                where: { order: { order_id: orderId } },
                relations: ["product"],
            });
            return orderDetails;
        } catch (error) {
            console.error('Error al obtener detalles del pedido:', error);
            throw new Error('Error al obtener detalles del pedido');
        }
    }

    // Actualizar la cantidad de un producto en el carrito (OrderDetail)
    async updateOrderDetailQuantity(orderDetailId: number, quantity: number): Promise<OrderDetail> {
        try {
            const orderDetail = await this.orderDetailRepository.findOneBy({ order_detail_id: orderDetailId });
            if (!orderDetail) {
                throw new Error('Detalle de pedido no encontrado');
            }
            orderDetail.quantity = quantity;
            return await this.orderDetailRepository.save(orderDetail);
        } catch (error) {
            console.error('Error al actualizar cantidad del producto:', error);
            throw new Error('Error al actualizar cantidad del producto');
        }
    }


    async calculateTotalPrice(userId?: number, sessionId?: string): Promise<{
        totalPrice: number,
        itemCount: number,
        orderDetails: OrderDetail[]
    }> {
        try {
            let orderDetails: OrderDetail[] = [];

            if (userId) {
                // Obtener detalles de pedidos para un usuario específico
                const orders = await this.orderDetailRepository.find({
                    where: { order: { user: { user_id: userId } } },
                    relations: ["order", "product"]
                });
                orderDetails = orders;
            } else if (sessionId) {
                // Obtener detalles de pedidos para una sesión específica
                const orders = await this.orderDetailRepository.find({
                    where: { order: { session_id: sessionId } },
                    relations: ["order", "product"]
                });
                orderDetails = orders;
            } else {
                throw new Error('Se requiere userId o sessionId');
            }

            if (orderDetails.length === 0) {
                return {
                    totalPrice: 0,
                    itemCount: 0,
                    orderDetails: []
                };
            }

            // Calcular el total
            const totalPrice = orderDetails.reduce((sum, item) => {
                return sum + (item.price || 0) * (item.quantity || 0);
            }, 0);

            return {
                totalPrice: parseFloat(totalPrice.toFixed(2)),
                itemCount: orderDetails.length,
                orderDetails
            };
        } catch (error) {
            console.error('Error al calcular el precio total:', error);
            throw new Error('Error al calcular el precio total');
        }
    }
}