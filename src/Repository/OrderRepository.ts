import { DataSource, Repository } from "typeorm";
import { Order } from "../entities/Order";

export class OrderRepository {
    private repo: Repository<Order>;

    constructor(dataSource: DataSource) {
        this.repo = dataSource.getRepository(Order);
    }

    async createOrder(order: Order): Promise<Order> {
        return await this.repo.save(order);
    }

    // Otros métodos si necesitas: getById, list, update...
}
