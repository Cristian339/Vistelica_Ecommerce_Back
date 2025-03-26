import { Request, Response } from "express";
import { OrderService } from "../Service/OrderService";
import { AppDataSource } from "../Config/database";
import { User } from "../Entities/User";
import { Products } from "../Entities/Products";
import {Repository} from "typeorm";
import {Order} from "../Entities/Order";
import {OrderDetail} from "../Entities/OrderDetail";

export class OrderController {
    private orderService: OrderService;
    private orderRepository: Repository<Order>;
    private orderDetailRepository: Repository<OrderDetail>;

    constructor() {
        this.orderService = new OrderService();
        this.orderRepository = AppDataSource.getRepository(Order);
        this.orderDetailRepository = AppDataSource.getRepository(OrderDetail);
    }

    // Crear un pedido
    async createOrder(req: Request, res: Response): Promise<Response> {
        try {
            const { userId, products } = req.body;

            // Validar usuario
            const user = await AppDataSource.getRepository(User).findOneBy({ user_id: userId });
            if (!user) return res.status(404).json({ message: "User not found" });

            // Validar productos y obtener entidades
            const productEntities = await Promise.all(
                products.map(async (item: any) => {
                    const product = await AppDataSource.getRepository(Products).findOneBy({ product_id: item.productId });
                    if (!product) throw new Error(`Product with ID ${item.productId} not found`);
                    return { product_id: product.product_id, quantity: item.quantity, price: item.price };
                })
            );

            // Crear pedido usando el servicio
            const order = await this.orderService.createOrder(userId, productEntities);

            return res.status(201).json(order);
        }catch (error) {
            if (error instanceof Error) {
                return res.status(500).json({ message: "Error creando pedido", error: error.message });
            }
            return res.status(500).json({ message: "Error creando pedido", error: "Unknown error" });
        }

    }

    //Obtener pedidos de un usuario
    async getOrdersByUser(req: Request, res: Response): Promise<Response> {
        try {
            const userId = Number(req.params.userId);
            if (isNaN(userId)) return res.status(400).json({ message: "Invalid user ID" });

            const orders = await this.orderService.getOrdersByUser(userId);
            return res.status(200).json(orders);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json({ message: "Error obteniendo pedido", error: error.message });
            }
            return res.status(500).json({ message: "Error obteniendo pedido", error: "Unknown error" });
        }

    }

    // Obtener detalles de un pedido
    async getOrderDetails(req: Request, res: Response): Promise<Response> {
        try {
            const orderId = Number(req.params.orderId);
            if (isNaN(orderId)) return res.status(400).json({ message: "Invalid order ID" });

            const orderDetails = await this.orderService.getOrderDetails(orderId);
            return res.status(200).json(orderDetails);
        }catch (error) {
            if (error instanceof Error) {
                return res.status(500).json({ message: "Error obteniendo pedido", error: error.message });
            }
            return res.status(500).json({ message: "Error obteniendo pedido", error: "Unknown error" });
        }

    }

    // Actualizar estado de un pedido
    async updateOrderStatus(req: Request, res: Response): Promise<Response> {
        try {
            const { status } = req.body;
            const orderId = Number(req.params.orderId);

            if (isNaN(orderId)) return res.status(400).json({ message: "Invalid order ID" });

            const validStatuses = ["productos en curso", "suspender pedido", "productos completados"];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ message: `Invalid status. Valid statuses: ${validStatuses.join(", ")}` });
            }

            await this.orderService.updateOrderStatus(orderId, status);

            return res.status(200).json({ message: "Order status updated successfully" });
        }catch (error) {
            if (error instanceof Error) {
                return res.status(500).json({ message: "Error actualizado pedido", error: error.message });
            }
            return res.status(500).json({ message: "Error actualizado pedido", error: "Unknown error" });
        }

    }

    // Cancelar un pedido
    async cancelOrder(req: Request, res: Response): Promise<Response> {
        try {
            const orderId = Number(req.params.orderId);
            if (isNaN(orderId)) return res.status(400).json({ message: "Invalid order ID" });

            // Obtener detalles del pedido
            const order = await this.orderService.getOrderDetails(orderId);
            if (!order) return res.status(404).json({ message: "Order not found" });

            // Eliminar los detalles del pedido
            await this.orderDetailRepository.delete({ order: { order_id: orderId } });

            // Eliminar el pedido
            await this.orderRepository.delete(orderId);

            return res.status(200).json({ message: "El pedido fue exitosamente cancelado" });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(500).json({ message: "Error eliminando pedido", error: error.message });
            }
            return res.status(500).json({ message: "Error eliminando pedido", error: "Unknown error" });
        }
    }

}
