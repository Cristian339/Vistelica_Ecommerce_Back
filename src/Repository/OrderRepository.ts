import { Repository } from "typeorm";
import { AppDataSource } from "../Config/database";
import { Order } from "../Entities/Order";

export class OrderRepository {
    private repo: Repository<Order>;

    constructor() {
        this.repo = AppDataSource.getRepository(Order);
    }

    // Buscar órdenes por usuario
    async findByUser(userId: number): Promise<Order[]> {
        return this.repo.find({ where: { user: { user_id: userId } } });
    }

    // Crear una nueva orden
    async createOrder(userId: number, status: string): Promise<Order> {
        const order = this.repo.create({ user: { user_id: userId }, status });
        return this.repo.save(order);
    }

    // Actualizar el estado de una orden
    async updateOrderStatus(orderId: number, status: string): Promise<Order | null> {
        const order = await this.repo.findOne({ where: { order_id: orderId } });
        if (!order) return null;
        order.status = status;
        return this.repo.save(order);
    }

    // Eliminar una orden
    async deleteOrder(orderId: number): Promise<boolean> {
        const result = await this.repo.delete(orderId);
        return result.affected !== 0;
    }
}
