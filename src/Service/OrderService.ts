import { DataSource } from "typeorm";
import { Order, OrderStatus } from "../Entities/Order";
import { OrderDetail, RefundStatus } from "../Entities/OrderDetail";
import { AdditionalAddress } from "../Entities/Address";
import { User } from "../Entities/User";
import { Size, Color } from "../Entities/Products";

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
        const productRepo = this.dataSource.getRepository("Products"); // Asegúrate de que el repositorio esté bien registrado

        const user = await userRepo.findOneBy({ user_id: dto.user_id }); // ajusta a tu campo real si es solo `id`
        if (!user) throw new Error("User not found");

        const address = await addressRepo.findOneBy({ id: dto.address_id });
        if (!address) throw new Error("Address not found");

        const order = new Order();
        order.user = user;
        order.address = address;
        order.payment_method_id = dto.payment_method_id || null;
        order.payment_method_name = dto.payment_method_name || null;
        order.status = OrderStatus.ALMACEN;

        const details: OrderDetail[] = [];
        let total = 0;

        for (const item of dto.details) {
            const detail = new OrderDetail();
            const product = await productRepo.findOneBy({ product_id: item.product_id });
            if (!product) throw new Error(`Product ${item.product_id} not found`);

            if (item.quantity <= 0 || item.price <= 0) {
                throw new Error("Cantidad y precio deben ser mayores que cero");
            }

            detail.product = product;
            detail.quantity = item.quantity;
            detail.price = item.price;
            detail.size = item.size ? item.size as Size : null;
            detail.color = item.color ? item.color as Color : null;

            total += detail.price * detail.quantity;
            details.push(detail);
        }

        order.details = details;
        order.total_price = total;
        order.shipping_cost = total > 50 ? 0 : 5;

        return await orderRepo.save(order);
    }

    async solicitarDevolucion(orderDetailId: number, motivo: string): Promise<OrderDetail> {
        const orderDetailRepo = this.dataSource.getRepository(OrderDetail);

        const detail = await orderDetailRepo.findOne({
            where: { order_detail_id: orderDetailId }
        });

        if (!detail) {
            throw new Error("Order detail not found");
        }

        if (detail.estado_devolucion !== RefundStatus.NADA) {
            throw new Error("Solo se puede solicitar devolución para items con estado 'Nada'");
        }

        detail.estado_devolucion = RefundStatus.REVISION;
        detail.motivo_devolucion = motivo;

        return await orderDetailRepo.save(detail);
    }

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

    async getRefundsInReview(): Promise<OrderDetail[]> {
        const orderDetailRepository = this.dataSource.getRepository(OrderDetail);

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

    async updateRefundStatus(
        orderDetailId: number,
        newStatus: RefundStatus.ACEPTADO | RefundStatus.RECHAZADO,
        rejectionReason?: string
    ): Promise<OrderDetail> {
        const orderDetailRepository = this.dataSource.getRepository(OrderDetail);

        const detail = await orderDetailRepository.findOne({
            where: { order_detail_id: orderDetailId },
            relations: ['order']
        });

        if (!detail) {
            throw new Error("Order detail not found");
        }

        if (detail.estado_devolucion !== RefundStatus.REVISION) {
            throw new Error("Solo se puede actualizar el estado de devoluciones en 'Revision'");
        }

        if (newStatus !== RefundStatus.ACEPTADO && newStatus !== RefundStatus.RECHAZADO) {
            throw new Error("El nuevo estado debe ser 'Aceptado' o 'Rechazado'");
        }

        if (newStatus === RefundStatus.RECHAZADO && !rejectionReason) {
            throw new Error("Debe proporcionar un motivo para rechazar la devolución");
        }

        detail.estado_devolucion = newStatus;

        if (newStatus === RefundStatus.RECHAZADO) {
            detail.motivo_devolucion = rejectionReason;
        }

        return await orderDetailRepository.save(detail);
    }
}
