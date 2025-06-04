import {Request, Response} from "express";
import {AppDataSource} from "../Config/database";
import {Order, OrderStatus} from "../Entities/Order";
import {OrderDetail, RefundStatus} from "../Entities/OrderDetail";
import {AdditionalAddress} from "../Entities/Address";
import {Products} from "../Entities/Products";
import {Payment} from "../Entities/Payment";
import {CartDetail} from "../Entities/CartDetail";
import {Cart} from "../Entities/Cart";
import {UserService} from "../Service/UserService";
import {uploadImage} from "../Config/Cloudinary";
import { EmailOrderService } from '../Service/EmailOrderService';
import {User} from "../Entities/User";
import fs from "fs";
import {OrderService} from "../Service/OrderService";
export class OrderController {
    private orderRepository = AppDataSource.getRepository(Order);
    private orderDetailRepository = AppDataSource.getRepository(OrderDetail);
    private addressRepository = AppDataSource.getRepository(AdditionalAddress);
    private productRepository = AppDataSource.getRepository(Products);
    private paymentRepository = AppDataSource.getRepository(Payment);
    private cartDetailRepository = AppDataSource.getRepository(CartDetail);
    private cartRepository = AppDataSource.getRepository(Cart);
    private userRepository = AppDataSource.getRepository(User);
    private emailService = new EmailOrderService();

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

            // Validar stock disponible antes de crear el pedido
            for (const item of details) {
                const product = await this.productRepository.findOne({
                    where: { product_id: item.product_id }
                });

                if (!product) {
                    return res.status(404).json({
                        message: `Producto con id ${item.product_id} no encontrado.`
                    });
                }

                if (product.stock_quantity < item.quantity) {
                    return res.status(400).json({
                        message: `Stock insuficiente para el producto "${product.name}". Stock disponible: ${product.stock_quantity}, cantidad solicitada: ${item.quantity}`
                    });
                }
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

            // Crear detalles del pedido y actualizar stock
            for (const item of details) {
                const product = await this.productRepository.findOne({
                    where: { product_id: item.product_id },
                    relations: ['images'] // Cargar imágenes del producto
                });

                if (!product) {
                    return res.status(404).json({
                        message: `Producto con id ${item.product_id} no encontrado.`
                    });
                }

                // Crear detalle del pedido
                const detail = new OrderDetail();
                detail.product = product;
                detail.price = item.price;
                detail.quantity = item.quantity;
                detail.size = item.size || null;
                detail.color = item.color || null;
                order.details.push(detail);

                // Actualizar stock del producto
                product.stock_quantity -= item.quantity;
                await this.productRepository.save(product);
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

            // Obtener el usuario completo con su email y perfil
            const user = await this.userRepository.findOne({
                where: { user_id: userId },
                relations: ['profile']
            }) as User;

            // Enviar correo de confirmación usando el servicio
            if (user && user.email) {
                await this.emailService.sendOrderConfirmationEmail(user, savedOrder, savedPayment);
            }

            return res.status(201).json({
                message: "Pedido y pago creados correctamente",
                order: savedOrder,
                payment: savedPayment
            });
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



    async solicitarDevolucion(req: Request, res: Response) {
        try {
            const userId = Number(req.user?.id);
            const { order_detail_id, motivo } = req.body;
            const file = req.file; // Ahora viene de uploadSingle

            if (!userId) {
                return res.status(401).json({ message: "No autorizado" });
            }

            if (!order_detail_id || !motivo) {
                // Limpiar archivo subido si hay error de validación
                if (file) fs.unlinkSync(file.path);
                return res.status(400).json({
                    message: "Se requieren order_detail_id y motivo"
                });
            }

            const detail = await this.orderDetailRepository.findOne({
                where: {
                    order_detail_id,
                    order: { user: { user_id: userId } }
                },
                relations: ['order', 'order.user']
            });

            if (!detail) {
                if (file) fs.unlinkSync(file.path);
                return res.status(404).json({
                    message: "Detalle de pedido no encontrado o no pertenece al usuario"
                });
            }

            if (detail.estado_devolucion !== RefundStatus.NADA) {
                if (file) fs.unlinkSync(file.path);
                return res.status(400).json({
                    message: "Solo se puede solicitar devolución para items con estado 'Nada'"
                });
            }

            let fotoUrl = null;
            if (file) {
                try {
                    fotoUrl = await uploadImage('devoluciones', file.path);
                } catch (error) {
                    console.error("Error al subir la imagen:", error);
                    return res.status(500).json({
                        message: "Error al subir la imagen de devolución"
                    });
                } finally {
                    // Asegurarse de eliminar el archivo temporal
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }
                }
            }

            detail.estado_devolucion = RefundStatus.REVISION;
            detail.motivo_devolucion = motivo;
            detail.foto_devolucion_url = fotoUrl;

            const updatedDetail = await this.orderDetailRepository.save(detail);

            return res.status(200).json({
                message: "Devolución solicitada correctamente",
                order_detail: updatedDetail
            });
        } catch (error) {
            // Limpiar archivo en caso de error
            if (req.file?.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            console.error("Error al solicitar devolución:", error);
            return res.status(500).json({
                message: "Error interno del servidor",
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    async getEntregadosConDetalles(req: Request, res: Response) {
        try {
            const userId = Number(req.user?.id);
            if (!userId) {
                return res.status(401).json({ message: "No autorizado" });
            }

            const orders = await this.orderRepository.find({
                where: {
                    user: { user_id: userId },
                    status: OrderStatus.ENTREGADO
                },
                relations: ['details', 'address', 'details.product'],
                order: { created_at: "DESC" }
            });

            // Limpiar información sensible
            const sanitizedOrders = orders.map(order => {
                const { user, ...rest } = order;
                return rest;
            });

            return res.status(200).json({ orders: sanitizedOrders });
        } catch (error) {
            console.error("Error al obtener pedidos entregados:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    }


    /**
     * Obtiene todos los OrderDetail que están en estado "Revision"
     */
    async getRefundsInReview(req: Request, res: Response) {
        try {
            const refunds = await this.orderDetailRepository.find({
                where: {
                    estado_devolucion: RefundStatus.REVISION
                },
                relations: {
                    order: {
                        user: true
                    },
                    product: true
                },
                order: {
                    order: {
                        created_at: "DESC"
                    }
                }
            });

            return res.status(200).json({
                success: true,
                data: refunds
            });
        } catch (error) {
            console.error("Error al obtener devoluciones en revisión:", error);
            return res.status(500).json({
                message: "Error interno del servidor",
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    /**
     * Actualiza el estado de una devolución
     */
    async updateRefundStatus(req: Request, res: Response) {
        try {
            const { order_detail_id } = req.params;
            const { status, rejection_reason } = req.body;


            if (!order_detail_id || !status) {
                return res.status(400).json({
                    message: "Se requieren order_detail_id y status"
                });
            }

            // Convertir status a enum
            let newStatus: RefundStatus.ACEPTADO | RefundStatus.RECHAZADO;
            if (status === 'Aceptado') {
                newStatus = RefundStatus.ACEPTADO;
            } else if (status === 'Rechazado') {
                newStatus = RefundStatus.RECHAZADO;
                if (!rejection_reason) {
                    return res.status(400).json({
                        message: "Se requiere un motivo para rechazar la devolución"
                    });
                }
            } else {
                return res.status(400).json({
                    message: "Status debe ser 'Aceptado' o 'Rechazado'"
                });
            }

            // Buscar el detalle del pedido
            const detail = await this.orderDetailRepository.findOne({
                where: { order_detail_id: Number(order_detail_id) },
                relations: ['order']
            });

            if (!detail) {
                return res.status(404).json({ message: "Detalle de pedido no encontrado" });
            }

            // Verificar que el estado actual sea "Revision"
            if (detail.estado_devolucion !== RefundStatus.REVISION) {
                return res.status(400).json({
                    message: "Solo se puede actualizar el estado de devoluciones en 'Revision'"
                });
            }

            // Actualizar los campos
            detail.estado_devolucion = newStatus;

            if (newStatus === RefundStatus.RECHAZADO) {
                detail.motivo_devolucion = rejection_reason;
            }

            // Guardar cambios
            const updatedDetail = await this.orderDetailRepository.save(detail);

            return res.status(200).json({
                success: true,
                data: updatedDetail
            });
        } catch (error) {
            console.error("Error al actualizar estado de devolución:", error);
            return res.status(500).json({
                message: "Error interno del servidor",
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

}
