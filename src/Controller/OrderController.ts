import {Request, Response} from "express";
import {AppDataSource} from "../Config/database";
import {Order, OrderStatus} from "../Entities/Order";
import {OrderDetail} from "../Entities/OrderDetail";
import {AdditionalAddress} from "../Entities/Address";
import {Products} from "../Entities/Products";
import {Payment} from "../Entities/Payment";
import {CartDetail} from "../Entities/CartDetail";
import {Cart} from "../Entities/Cart";
import {UserService} from "../Service/UserService";

export class OrderController {
    private orderRepository = AppDataSource.getRepository(Order);
    private orderDetailRepository = AppDataSource.getRepository(OrderDetail);
    private addressRepository = AppDataSource.getRepository(AdditionalAddress);
    private productRepository = AppDataSource.getRepository(Products);
    private paymentRepository = AppDataSource.getRepository(Payment);
    private cartDetailRepository = AppDataSource.getRepository(CartDetail);
    private cartRepository = AppDataSource.getRepository(Cart);
    private userService: UserService = new UserService();
    // Crear pedido
    async createOrder(req: Request, res: Response) {
        try {
            const userId = Number(req.user?.id);
            if (!userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const {
                address_id,
                payment_method_id,
                payment_method_name,
                details
            } = req.body;

            if (!address_id || !details || !Array.isArray(details) || details.length === 0) {
                return res.status(400).json({ message: "Datos incompletos para crear el pedido." });
            }

            const address = await this.addressRepository.findOne({
                where: { id: address_id, user_id: userId }
            });
            if (!address) {
                return res.status(404).json({ message: "Dirección no encontrada o no pertenece al usuario." });
            }

            // Calcular total_price sin envío
            let total_price = 0;
            for (const item of details) {
                total_price += Number(item.price) * Number(item.quantity);
            }

            // Añadir coste de envío si total_price <= 50
            const shippingCost = total_price > 50 ? 0 : 5;
            const finalTotal = total_price + shippingCost;

            // Calcular fecha estimada de entrega (3 días después de hoy)
            const estimatedDeliveryDate = new Date();
            estimatedDeliveryDate.setDate(estimatedDeliveryDate.getDate() + 3);


            // Crear la orden
            const order = new Order();
            order.user = { user_id: userId } as any;
            order.address = address;
            order.payment_method_id = 0;
            order.payment_method_name = payment_method_name || null;
            order.status = OrderStatus.ALMACEN;
            order.total_price = finalTotal;
            order.estimated_delivery_date = estimatedDeliveryDate;

            order.details = [];
            for (const item of details) {
                const product = await this.productRepository.findOneBy({ product_id: item.product_id });
                if (!product) {
                    return res.status(404).json({ message: `Producto con id ${item.product_id} no encontrado.` });
                }
                const detail = new OrderDetail();
                detail.product = product;
                detail.price = item.price;
                detail.quantity = item.quantity;
                detail.size = item.size || null;
                detail.color = item.color || null;
                order.details.push(detail);
            }
            // Generar número de pedido legible
            const now = new Date();
            const datePart = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
            const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6 caracteres aleatorios
            order.order_number = `ORD-${datePart}-${randomPart}`;

            // Guardar pedido con detalles
            const savedOrder = await this.orderRepository.save(order);

            // Crear pago asociado
            const payment = new Payment();
            payment.order = savedOrder;
            payment.payment_method = payment_method_name || 'No especificado';
            payment.payment_status = 'COMPLETADO';
            payment.amount = finalTotal;

            const savedPayment = await this.paymentRepository.save(payment);

            // Actualizar el payment_method_id del pedido con el id del pago creado
            savedOrder.payment_method_id = savedPayment.payment_id;
            await this.orderRepository.save(savedOrder);

            return res.status(201).json({ message: "Pedido y pago creados correctamente", order: savedOrder, payment: savedPayment });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    }


    // Actualizar método de pago en el pedido
    async updatePaymentMethod(orderId: number, paymentMethodId: number) {
        const order = await this.orderRepository.findOneBy({ order_id: orderId });
        if (!order) throw new Error(`Pedido con id ${orderId} no encontrado`);

        order.payment_method_id = paymentMethodId;
        await this.orderRepository.save(order);
    }
    async getOrdersByUser(req: Request, res: Response) {
        try {
            const userId = Number(req.user?.id);
            if (!userId) {
                return res.status(401).json({ message: "No autorizado" });
            }

            const orders = await this.orderRepository.find({
                where: { user: { user_id: userId } },
                relations: ['address', 'details', 'details.product'], // solo incluye lo necesario
                order: { created_at: "DESC" }
            });

            // Eliminar el campo "user" de cada pedido
            const sanitizedOrders = orders.map(order => {
                const { user, ...rest } = order;
                return rest;
            });

            return res.status(200).json({ orders: sanitizedOrders });
        } catch (error) {
            console.error("Error al obtener pedidos del usuario:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    }

    async getOrderDetailsById(req: Request, res: Response) {
        try {
            const userId = Number(req.user?.id);
            const orderId = Number(req.params.id); // <-- aquí corriges el nombre del parámetro

            console.log("🧾 Verificando pedido", { userId, orderId });

            if (!userId) {
                return res.status(401).json({ message: "No autorizado" });
            }

            if (isNaN(orderId)) {
                return res.status(400).json({ message: "ID de pedido no válido" });
            }

            const order = await this.orderRepository.findOne({
                where: {
                    order_id: orderId,
                    user: { user_id: userId }
                },
                relations: ["details", "details.product", "address", "payments"]
            });

            if (!order) {
                return res.status(404).json({ message: "Pedido no encontrado o no pertenece al usuario." });
            }
            // Limpiar información sensible de un usuario
            if ((order as any).user) {
                delete (order as any).user;
            }

            return res.status(200).json({ order });
        } catch (error) {
            console.error("❌ Error al obtener detalles del pedido:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    }

    async markOrderAsShipped(req: Request, res: Response) {
        try {
            const orderId = Number(req.params.id);
            if (isNaN(orderId)) {
                return res.status(400).json({ message: "ID de pedido no válido" });
            }

            const order = await this.orderRepository.findOneBy({ order_id: orderId });
            if (!order) {
                return res.status(404).json({ message: "Pedido no encontrado" });
            }

            order.status = OrderStatus.ENVIADO;
            await this.orderRepository.save(order);

            return res.status(200).json({ message: "Pedido marcado como ENVIADO" });
        } catch (error) {
            console.error("❌ Error al marcar como enviado:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    }
    async markOrderAsDelivered(req: Request, res: Response) {
        try {
            const orderId = Number(req.params.id);
            if (isNaN(orderId)) {
                return res.status(400).json({ message: "ID de pedido no válido" });
            }

            const order = await this.orderRepository.findOneBy({ order_id: orderId });
            if (!order) {
                return res.status(404).json({ message: "Pedido no encontrado" });
            }

            order.status = OrderStatus.ENTREGADO;
            order.delivered_at = new Date();
            await this.orderRepository.save(order);

            return res.status(200).json({ message: "Pedido marcado como ENTREGADO y fecha registrada" });
        } catch (error) {
            console.error("❌ Error al marcar como entregado:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    }



    async getIdsDetails(req: Request, res: Response) {
        try {
            const token = req.headers.authorization;

            if (!token) {
                return res.status(401).json({ message: 'Token no proporcionado' });
            }

            const user = await this.userService.getUserFromToken(token);

            // Buscar órdenes entregadas con relaciones necesarias
            const deliveredOrders = await this.orderRepository.find({
                where: {
                    user: { user_id: user.user_id },
                    status: OrderStatus.ENTREGADO
                },
                relations: ['details', 'details.product'],
                order: { delivered_at: 'DESC' }
            });

            // Extraer solo los product_id de todos los detalles
            const productIds = deliveredOrders.flatMap(order =>
                order.details.map(detail => detail.product.product_id)
            );

            // Eliminar duplicados y devolver solo los IDs
            const uniqueProductIds = [...new Set(productIds)];

            return res.status(200).json({ product_ids: uniqueProductIds });
        } catch (error) {
            console.error("Error al obtener IDs de productos entregados:", error);
            return res.status(500).json({
                message: "Error interno del servidor",
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

}
