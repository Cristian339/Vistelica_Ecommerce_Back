import { Repository } from "typeorm";
import { Order } from "../Entities/Order";

export class ShoppingCartRepository extends Repository<Order> {
    // Crear un nuevo pedido (carrito)
    async createOrder(userId: number): Promise<Order> {
        const order = this.create({ user: { user_id: userId }, status: "en proceso" });
        return await this.save(order);
    }

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