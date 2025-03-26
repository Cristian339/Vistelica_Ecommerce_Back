import { Order } from "../Entities/Order";
import { OrderDetail } from "../Entities/OrderDetail";
import { Repository } from "typeorm";
import { AppDataSource } from "../Config/database";
import { Products } from "../Entities/Products";
import {User} from "../Entities/User";

export class OrderService {
    private orderRepository: Repository<Order>;
    private orderDetailRepository: Repository<OrderDetail>;
    private productRepository: Repository<Products>;
    private userRepository: Repository<User>;

    constructor() {
        this.orderRepository = AppDataSource.getRepository(Order);
        this.orderDetailRepository = AppDataSource.getRepository(OrderDetail);
        this.productRepository = AppDataSource.getRepository(Products);
        this.userRepository = AppDataSource.getRepository(User);
    }

    // Crear un nuevo pedido
    async createOrder(userId: number, products: { product_id: number; quantity: number; price: number }[]): Promise<Order> {
        // Obtener al usuario desde la base de datos
        const user = await this.userRepository.findOne({ where: { user_id: userId } });
        if (!user) throw new Error("User not found");

        // Crear el pedido
        const order = this.orderRepository.create({
            user, // Asociamos el usuario completo
            status: "productos en curso", // Estado inicial del pedido
        });

        // Guardar el pedido
        const newOrder = await this.orderRepository.save(order);

        // Agregar los detalles del pedido
        for (const item of products) {
            const product = await this.productRepository.findOne({ where: { product_id: item.product_id } });
            if (!product) throw new Error(`Product with ID ${item.product_id} not found`);

            // Crear un detalle del pedido para cada producto
            const orderDetail = this.orderDetailRepository.create({
                order: newOrder, // Relación con el pedido
                product, // Relación con el producto
                quantity: item.quantity,
                price: item.price,
            });

            // Guardar el detalle del pedido
            await this.orderDetailRepository.save(orderDetail);
        }

        // Devolver el pedido con los detalles
        return newOrder;
    }


    // Obtener los pedidos de un usuario
    async getOrdersByUser(userId: number): Promise<Order[]> {
        return await this.orderRepository.find({
            where: { user: { user_id: userId } },
            relations: ["user"],
        });
    }

    // Obtener los detalles de un pedido
    async getOrderDetails(orderId: number): Promise<any> {
        // Buscar los detalles del pedido y también incluir la relación con 'order' para obtener el 'status'
        const orderDetails = await this.orderDetailRepository.find({
            where: { order: { order_id: orderId } },
            relations: ["product", "order"], // Incluir la relación con 'order' para obtener el estado
        });

        // Verificar si encontramos el pedido
        if (orderDetails.length === 0) {
            throw new Error(`Order with ID ${orderId} not found`);
        }

        // Devolver el pedido con su estado y detalles
        const order = orderDetails[0].order; // Obtener el 'order' desde el primer detalle (todos los detalles pertenecen al mismo pedido)
        return {
            order_id: order.order_id,
            status: order.status,
            created_at: order.created_at,
            updated_at: order.updated_at,
            details: orderDetails.map((detail) => ({
                product_id: detail.product.product_id,
                product_name: detail.product.name,
                quantity: detail.quantity,
                price: detail.price,
            })),
        };
    }


    // Actualizar estado del pedido
    async updateOrderStatus(orderId: number, status: string): Promise<void> {
        await this.orderRepository.update(orderId, { status });
    }

    // Cancelar un pedido
    async cancelOrder(orderId: number): Promise<void> {
        await this.orderRepository.delete(orderId);
    }
}
