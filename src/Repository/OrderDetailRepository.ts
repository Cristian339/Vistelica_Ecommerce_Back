import { EntityRepository, Repository } from "typeorm";
import { OrderDetail } from "../Entities/OrderDetail";

@EntityRepository(OrderDetail)
export class OrderDetailRepository extends Repository<OrderDetail> {
    async findByOrder(orderId: number): Promise<OrderDetail[]> {
        return this.find({ where: { order: { order_id: orderId } }, relations: ["product"] });
    }

    async createOrderDetail(orderId: number, productId: number, quantity: number, price: number): Promise<OrderDetail> {
        const orderDetail = this.create({
            order: { order_id: orderId },
            product: { product_id: productId },
            quantity,
            price,
        });
        return this.save(orderDetail);
    }

    async deleteOrderDetail(orderDetailId: number): Promise<boolean> {
        const result = await this.delete(orderDetailId);
        return result.affected !== 0;
    }
}
