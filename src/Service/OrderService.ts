import { DataSource } from "typeorm";
import { Order, OrderStatus } from "../entities/Order";
import { OrderDetail } from "../entities/OrderDetail";
import { AdditionalAddress } from "../entities/Address";
import { User } from "../entities/User";

interface CreateOrderDTO {
    user_id: number;
    address_id: number;
    payment_method_id?: number;
    payment_method_name?: string;
    details: {
        product_id: number;
        quantity: number;
        price: number;
        size?: string | null;
        color?: string | null;
    }[];
}

export class OrderService {
    private dataSource: DataSource;

    constructor(dataSource: DataSource) {
        this.dataSource = dataSource;
    }

    async createOrder(dto: CreateOrderDTO): Promise<Order> {
        const userRepo = this.dataSource.getRepository(User);
        const addressRepo = this.dataSource.getRepository(AdditionalAddress);
        const orderRepo = this.dataSource.getRepository(Order);
        const productRepo = this.dataSource.getRepository("Products"); // asumiendo existe

        // Buscar usuario y dirección
        const user = await userRepo.findOneBy({ id: dto.user_id });
        if (!user) throw new Error("User not found");

        const address = await addressRepo.findOneBy({ id: dto.address_id });
        if (!address) throw new Error("Address not found");

        // Crear pedido
        const order = new Order();
        order.user = user;
        order.address = address;
        order.payment_method_id = dto.payment_method_id || null;
        order.payment_method_name = dto.payment_method_name || null;
        order.status = OrderStatus.ALMACEN;

        // Crear detalles y calcular total
        const details: OrderDetail[] = [];
        let total = 0;

        for (const item of dto.details) {
            const detail = new OrderDetail();
            detail.product = await productRepo.findOneBy({ product_id: item.product_id });
            if (!detail.product) throw new Error(`Product ${item.product_id} not found`);

            detail.quantity = item.quantity;
            detail.price = item.price;
            detail.size = item.size || null;
            detail.color = item.color || null;

            total += detail.price * detail.quantity;
            details.push(detail);
        }

        order.details = details;
        order.total_price = total;

        // Calcular gastos de envío
        order.shipping_cost = total > 50 ? 0 : 5;

        // Guardar pedido con detalles (cascade)
        return await orderRepo.save(order);
    }
}
