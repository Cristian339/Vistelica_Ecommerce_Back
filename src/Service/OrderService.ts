import { Order } from "../Entities/Order";
import { OrderDetail } from "../Entities/OrderDetail";
import { Repository } from "typeorm";
import { AppDataSource } from "../Config/database";
import { Products } from "../Entities/Products";
import {User} from "../Entities/User";
import {PaymentService} from "./PaymentService";
import {Payment} from "../Entities/Payment";
import {OrderDetailResponseDTO} from "../DTO/OrderDetailResponseDTO";
import {OrderResponseDTO} from "../DTO/OrderResponseDTO";
import {ProductImage} from "../Entities/ProductImage";
import {UserOrdersDTO} from "../DTO/UserOrdersDTO";

export class OrderService {
    private orderRepository: Repository<Order>;
    private orderDetailRepository: Repository<OrderDetail>;
    private productRepository: Repository<Products>;
    private userRepository: Repository<User>;
    private paymentService : PaymentService;
    private productImageRepository: Repository<ProductImage>;
    constructor() {
        this.orderRepository = AppDataSource.getRepository(Order);
        this.orderDetailRepository = AppDataSource.getRepository(OrderDetail);
        this.productRepository = AppDataSource.getRepository(Products);
        this.userRepository = AppDataSource.getRepository(User);
        this.paymentService = new PaymentService();
        this.productImageRepository = AppDataSource.getRepository(ProductImage);
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
    async getOrderDetails(orderId: number): Promise<{
        order_id: number;
        status: string;
        payment_method?: string;
        details: Array<{
            product_id: number;
            product_name: string;
            quantity: number;
            price: number;
        }>;
    }> {
        const orderDetails = await this.orderDetailRepository.find({
            where: { order: { order_id: orderId } },
            relations: ["product", "order"],
        });

        if (orderDetails.length === 0) {
            throw new Error(`Order with ID ${orderId} not found`);
        }

        const order = orderDetails[0].order;
        const payment = order.payment ? await this.paymentService.getPaymentById(order.payment) : null;

        return {
            order_id: order.order_id,
            status: order.status,
            payment_method: payment?.payment_method,
            details: orderDetails.map(detail => ({
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


    async getAllOrdersWithClientInfo(): Promise<Array<{
        order_id: number;
        created_at: Date;
        status: string;
        client: {
            name: string;
            email: string;
            address: string;
        };
    }>> {

        const orders = await this.orderRepository.find({
            relations: ["user", "user.profile"],
            order: { created_at: "DESC" },
            select: {
                order_id: true,
                created_at: true,
                status: true,
                address: true,
                user: {
                    user_id: true,
                    email: true,
                    profile: {
                        name: true
                    }
                }
            }
        });

        return orders.map(order => ({
            order_id: order.order_id,
            created_at: order.created_at,
            status: order.status,
            client: {
                name: order.user?.profile?.name || 'Nombre no disponible',
                email: order.user?.email || 'Email no disponible',
                address: order.address || 'Dirección no especificada'
            }
        }));
    }
    async getUserOrders(user_id: number): Promise<UserOrdersDTO> {
        // Obtener todos los pedidos del usuario
        const orders = await this.orderRepository.find({
            where: { user: { user_id } },
            order: { created_at: "DESC" }
        });

        // Crear array para almacenar los pedidos procesados
        const processedOrders: OrderResponseDTO[] = [];

        // Procesar cada pedido
        for (const order of orders) {
            // Obtener detalles del pedido
            const orderDetails = await this.orderDetailRepository.find({
                where: { order: { order_id: order.order_id } },
                relations: ["product"]
            });

            // Procesar detalles del pedido
            const processedDetails: OrderDetailResponseDTO[] = [];
            for (const detail of orderDetails) {
                // Obtener la primera imagen del producto (si existe)
                const productImage = await this.productImageRepository.findOne({
                    where: { product: { product_id: detail.product.product_id } },
                    order: { is_main: "DESC" }
                });

                // Obtener el producto completo para acceder al precio y descuento
                const product = await this.productRepository.findOne({
                    where: { product_id: detail.product.product_id }
                });

                if (!product) {
                    continue; // Saltar si el producto no existe
                }

                // Calcular el precio final considerando el descuento
                const originalPrice = product.price;
                const discountPercentage = product.discount_percentage || 0;
                const finalPrice = originalPrice * (1 - discountPercentage / 100);

                // Crear DTO para detalle del pedido
                processedDetails.push(new OrderDetailResponseDTO(
                    detail.order_detail_id,
                    detail.product.product_id,
                    detail.product.name,
                    detail.quantity,
                    originalPrice,
                    discountPercentage,
                    finalPrice,
                    detail.size,
                    detail.color,
                    productImage ? productImage.image_url : null
                ));
            }

            // Crear DTO para el pedido y añadirlo al array
            processedOrders.push(new OrderResponseDTO(
                order.order_id,
                order.status,
                order.created_at,
                order.updated_at,
                order.address || null,
                processedDetails
            ));
        }

        // Retornar DTO con todos los pedidos
        return new UserOrdersDTO(processedOrders);
    }
}
