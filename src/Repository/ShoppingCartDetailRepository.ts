import { Repository } from "typeorm";
import { OrderDetail } from "../Entities/OrderDetail";
import { Products } from "../Entities/Products";

export class ShoppingCartDetailRepository extends Repository<OrderDetail> {
    // Añadir un producto al carrito
    async addProductToOrder(orderId: number, productId: number, quantity: number, price: number): Promise<OrderDetail> {
        const orderDetail = this.create({
            order: { order_id: orderId },
            product: { product_id: productId },
            quantity,
            price,
        });
        return await this.save(orderDetail);
    }

    // Eliminar un producto del carrito
    async removeProductFromOrder(orderDetailId: number): Promise<void> {
        await this.delete(orderDetailId);
    }

    // Obtener los detalles de un pedido (carrito)
    async getOrderDetails(orderId: number): Promise<OrderDetail[]> {
        return await this.find({ where: { order: { order_id: orderId } }, relations: ["product"] });
    }
}