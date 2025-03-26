import { Order } from "../Entities/Order";
import { OrderDetail } from "../Entities/OrderDetail";
import { Repository } from "typeorm";
import { AppDataSource } from "../Config/database";
import { Products } from "../Entities/Products";

export class OrderService {
    private orderRepository: Repository<Order>;
    private orderDetailRepository: Repository<OrderDetail>;
    private productRepository: Repository<Products>;

    constructor() {
        this.orderRepository = AppDataSource.getRepository(Order);
        this.orderDetailRepository = AppDataSource.getRepository(OrderDetail);
        this.productRepository = AppDataSource.getRepository(Products);
    }

    /** 🔹 Crear un nuevo pedido */
    async createOrder(userId: number, products: { product_id: number; quantity: number; price: number }[]): Promise<Order> {
        // Crear el pedido
        const order = this.orderRepository.create({
            user: { user_id: userId },
            status: "productos en curso",
        });
        const newOrder = await this.orderRepository.save(order);

        // Agregar los detalles del pedido
        for (const item of products) {
            const product = await this.productRepository.findOne({ where: { product_id: item.product_id } });
            if (!product) throw new Error(`Product with ID ${item.product_id} not found`);

            const orderDetail = this.orderDetailRepository.create({
                order: newOrder,
                product,
                quantity: item.quantity,
                price: item.price,
            });

            await this.orderDetailRepository.save(orderDetail);
        }

        return newOrder;
    }

    /** 🔹 Agregar un producto al pedido */
    async createOrderDetail(orderId: number, productId: number, quantity: number, price: number): Promise<OrderDetail> {
        const order = await this.orderRepository.findOne({ where: { order_id: orderId } });
        if (!order) throw new Error("Order not found");

        const product = await this.productRepository.findOne({ where: { product_id: productId } });
        if (!product) throw new Error("Product not found");

        const orderDetail = this.orderDetailRepository.create({
            order,
            product,
            quantity,
            price,
        });

        return await this.orderDetailRepository.save(orderDetail);
    }

    /** 🔹 Obtener los pedidos de un usuario */
    async getOrdersByUser(userId: number): Promise<Order[]> {
        return await this.orderRepository.find({
            where: { user: { user_id: userId } },
            relations: ["user"],
        });
    }

    /** 🔹 Obtener los detalles de un pedido */
    async getOrderDetails(orderId: number): Promise<OrderDetail[]> {
        return await this.orderDetailRepository.find({
            where: { order: { order_id: orderId } },
            relations: ["product"],
        });
    }

    /** 🔹 Actualizar estado del pedido */
    async updateOrderStatus(orderId: number, status: string): Promise<void> {
        await this.orderRepository.update(orderId, { status });
    }

    /** 🔹 Cancelar un pedido */
    async cancelOrder(orderId: number): Promise<void> {
        await this.orderRepository.delete(orderId);
    }
}
