import { EntityRepository, Repository } from "typeorm";
import { Order } from "../Entities/Order";

@EntityRepository(Order)
export class OrderRepository extends Repository<Order> {
    async findByUser(userId: number): Promise<Order[]> {
        return this.find({ where: { user: { user_id: userId } } });
    }

    async createOrder(userId: number, status: string): Promise<Order> {
        const order = this.create({ user: { user_id: userId }, status });
        return this.save(order);
    }

    async updateOrderStatus(orderId: number, status: string): Promise<Order | null> {
        const order = await this.findOne({ where: { order_id: orderId } });
        if (!order) return null;
        order.status = status;
        return this.save(order);
    }

    async deleteOrder(orderId: number): Promise<boolean> {
        const result = await this.delete(orderId);
        return result.affected !== 0;
    }
}
