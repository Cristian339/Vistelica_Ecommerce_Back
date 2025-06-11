import { Repository } from "typeorm";
import { Order } from "../Entities/Order";

export class CartRepository extends Repository<Order> {
    // Crear un nuevo pedido (carrito)

    // Obtener un pedido por su ID
    async getOrderById(orderId: number): Promise<Order | null> {
        // @ts-ignore
        return await this.findOne(orderId, { relations: ["user", "orderDetails"] });
    }

    // Actualizar el estado de un pedido
    async updateOrderStatus(orderId: number, status: string): Promise<Order | undefined> {
        // @ts-ignore
        const order = await this.findOne(orderId);
        if (order) {
            order.status = status;
            return await this.save(order);
        }
        return undefined;
    }

    // Eliminar un pedido (carrito)
    async deleteOrder(orderId: number): Promise<void> {
        await this.delete(orderId);
    }
}