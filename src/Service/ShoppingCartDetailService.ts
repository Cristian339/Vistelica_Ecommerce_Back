import { AppDataSource } from '../Config/database'; // Asegúrate de importar la fuente de datos correcta
import { OrderDetail } from '../Entities/OrderDetail';
import { Order } from '../Entities/Order';
import { Products } from '../Entities/Products';

export class ShoppingCartDetailService {

    private orderDetailRepository = AppDataSource.getRepository(OrderDetail); // Repositorio de OrderDetail

    // Añadir un producto al carrito (OrderDetail)
    async addProductToOrder(orderId: number, productId: number, quantity: number, price: number): Promise<OrderDetail> {
        try {
            const order = { order_id: orderId } as Order; // Simula un pedido con el ID proporcionado
            const product = { product_id: productId } as Products; // Simula un producto con el ID proporcionado
            const orderDetail = this.orderDetailRepository.create({
                order,
                product,
                quantity,
                price,
            }); // Crear una nueva entidad OrderDetail
            return await this.orderDetailRepository.save(orderDetail); // Guardar el detalle del pedido en la base de datos
        } catch (error) {
            console.error('Error adding product to order:', error);
            throw new Error('Error adding product to order');
        }
    }

    // Eliminar un producto del carrito (OrderDetail)
    async removeProductFromOrder(orderDetailId: number): Promise<void> {
        try {
            const orderDetail = await this.orderDetailRepository.findOneBy({ order_detail_id: orderDetailId });
            if (!orderDetail) {
                throw new Error('Order detail not found');
            }
            await this.orderDetailRepository.delete(orderDetailId);
        } catch (error) {
            console.error('Error removing product from order:', error);
            throw new Error('Error removing product from order');
        }
    }

    // Obtener los detalles de un pedido (OrderDetails)
    async getOrderDetails(orderId: number): Promise<OrderDetail[]> {
        try {
            const orderDetails = await this.orderDetailRepository.find({
                where: { order: { order_id: orderId } },
                relations: ["product"], // Incluir relación con Product
            });
            return orderDetails;
        } catch (error) {
            console.error('Error fetching order details:', error);
            throw new Error('Error fetching order details');
        }
    }

    // Actualizar la cantidad de un producto en el carrito (OrderDetail)
    async updateOrderDetailQuantity(orderDetailId: number, quantity: number): Promise<OrderDetail> {
        try {
            const orderDetail = await this.orderDetailRepository.findOneBy({ order_detail_id: orderDetailId });
            if (!orderDetail) {
                throw new Error('Order detail not found');
            }
            orderDetail.quantity = quantity;
            return await this.orderDetailRepository.save(orderDetail);
        } catch (error) {
            console.error('Error updating order detail quantity:', error);
            throw new Error('Error updating order detail quantity');
        }
    }
}