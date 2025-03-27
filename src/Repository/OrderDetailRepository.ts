import { Repository } from "typeorm";
import { AppDataSource } from "../Config/database";
import { OrderDetail } from "../Entities/OrderDetail";

export class OrderDetailRepository {
    private repo: Repository<OrderDetail>;

    constructor() {
        this.repo = AppDataSource.getRepository(OrderDetail);
    }

    // Buscar detalles de la orden por ID de orden
    async findByOrder(orderId: number): Promise<OrderDetail[]> {
        return this.repo.find({ where: { order: { order_id: orderId } }, relations: ["product"] });
    }

    // Crear un nuevo detalle de orden
    async createOrderDetail(orderId: number, productId: number, quantity: number, price: number): Promise<OrderDetail> {
        const orderDetail = this.repo.create({
            order: { order_id: orderId },
            product: { product_id: productId },
            quantity,
            price,
        });
        return this.repo.save(orderDetail);
    }

    // Eliminar un detalle de orden
    async deleteOrderDetail(orderDetailId: number): Promise<boolean> {
        const result = await this.repo.delete(orderDetailId);
        return result.affected !== 0;
    }
}

