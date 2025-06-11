import { DataSource } from "typeorm";
import { Order, OrderStatus } from "../Entities/Order";
import {OrderDetail, RefundStatus} from "../Entities/OrderDetail";
import { AdditionalAddress } from "../Entities/Address";
import { User } from "../Entities/User";

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



    /**
     * Cambia el estado de un order_detail de "Nada" a "Revision"
     * @param orderDetailId ID del detalle de pedido
     * @param motivo Motivo de la devolución
     * @returns OrderDetail actualizado
     */
    async solicitarDevolucion(orderDetailId: number, motivo: string): Promise<OrderDetail> {
        const orderDetailRepo = this.dataSource.getRepository(OrderDetail);

        // Buscar el detalle del pedido
        const detail = await orderDetailRepo.findOne({
            where: { order_detail_id: orderDetailId }
        });

        if (!detail) {
            throw new Error("Order detail not found");
        }

        // Verificar que el estado actual sea "Nada"
        if (detail.estado_devolucion !== RefundStatus.NADA) {
            throw new Error("Solo se puede solicitar devolución para items con estado 'Nada'");
        }

        // Actualizar los campos
        detail.estado_devolucion = RefundStatus.REVISION;
        detail.motivo_devolucion = motivo;

        // Guardar cambios
        return await orderDetailRepo.save(detail);
    }

    /**
     * Obtiene todos los pedidos de un usuario con estado "Entregado" y sus detalles
     * @param userId ID del usuario
     * @returns Array de pedidos con sus detalles
     */
    async getEntregadosConDetalles(userId: number): Promise<Order[]> {
        const orderRepo = this.dataSource.getRepository(Order);

        return await orderRepo.find({
            where: {
                user: { user_id: userId },
                status: OrderStatus.ENTREGADO
            },
            relations: {
                details: true,
                address: true
            },
            order: {
                created_at: "DESC"
            }
        });
    }



    /**
     * Obtiene todas las devoluciones en estado "Revision"
     */
    async getRefundsInReview() {
        let orderDetailRepository = this.dataSource.getRepository(OrderDetail);
        return await orderDetailRepository.find({
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
    }

    /**
     * Actualiza el estado de una devolución
     */
    async updateRefundStatus(
        orderDetailId: number,
        newStatus: RefundStatus.ACEPTADO | RefundStatus.RECHAZADO,
        rejectionReason?: string
    ) {
        // Buscar el detalle del pedido
        let orderDetailRepository = this.dataSource.getRepository(OrderDetail);
        const detail = await orderDetailRepository.findOne({
            where: { order_detail_id: orderDetailId },
            relations: ['order']
        });

        if (!detail) {
            throw new Error("Order detail not found");
        }

        // Verificar que el estado actual sea "Revision"
        if (detail.estado_devolucion !== RefundStatus.REVISION) {
            throw new Error("Solo se puede actualizar el estado de devoluciones en 'Revision'");
        }

        // Validar que el nuevo estado sea válido
        if (newStatus !== RefundStatus.ACEPTADO && newStatus !== RefundStatus.RECHAZADO) {
            throw new Error("El nuevo estado debe ser 'Aceptado' o 'Rechazado'");
        }

        // Si es rechazo, requerir motivo
        if (newStatus === RefundStatus.RECHAZADO && !rejectionReason) {
            throw new Error("Debe proporcionar un motivo para rechazar la devolución");
        }

        // Actualizar los campos
        detail.estado_devolucion = newStatus;

        if (newStatus === RefundStatus.RECHAZADO) {
            detail.motivo_devolucion = rejectionReason;
        }

        // Guardar cambios
        return await orderDetailRepository.save(detail);
    }
}
