import { AppDataSource } from '../Config/database';
import { Payment } from '../Entities/Payment';
import { Order } from '../Entities/Order';
import {FindOptionsWhere} from "typeorm";

export class PaymentService {
    private paymentRepository = AppDataSource.getRepository(Payment);
    private orderRepository = AppDataSource.getRepository(Order);

    // Obtener un pago por su ID con detalles completos
    async getPaymentById(id: Payment | null | undefined): Promise<Payment | null> {
        try {
            const payment = await this.paymentRepository.findOne({
                where: { payment_id: id } as FindOptionsWhere<Payment>,
                relations: ['order', 'order.user', 'order.orderDetails']
            });

            if (!payment) {
                throw new Error('Pago no encontrado');
            }

            return payment;
        } catch (error) {
            console.error('Error al obtener pago por ID:', error);
            throw new Error('Error al obtener el pago');
        }
    }
    /*
    // Crear un nuevo pago
    async createPayment(data: {
        order_id: number;
        payment_method: string;
        payment_status: string;
        amount: number;
    }): Promise<Payment> {
        try {
            // Verificar que la orden existe
            const order = await this.orderRepository.findOneBy({ order_id: data.order_id });
            if (!order) {
                throw new Error('Orden no encontrada');
            }

            // Crear el pago
            const payment = this.paymentRepository.create({
                order: order,
                payment_method: data.payment_method,
                payment_status: data.payment_status,
                amount: data.amount,
                payment_date: new Date()
            });

            const savedPayment = await this.paymentRepository.save(payment);

            // Actualizar el estado de la orden si es necesario
            if (data.payment_status === 'completed') {
                order.status = 'paid';
                await this.orderRepository.save(order);
            }

            return savedPayment;
        } catch (error) {
            console.error('Error al crear pago:', error);
            throw new Error('Error al crear el pago');
        }
    }

    // Actualizar el estado de un pago
    /*async updatePaymentStatus(id: number, newStatus: string): Promise<Payment> {
        try {
            const payment = await this.paymentRepository.findOneBy({ payment_id: id });
            if (!payment) {
                throw new Error('Pago no encontrado');
            }

            payment.payment_status = newStatus;
            const updatedPayment = await this.paymentRepository.save(payment);

            // Si el pago se completa, actualizar el estado de la orden
            if (newStatus === 'completed') {
                const order = await this.orderRepository.findOneBy({ order_id: payment.order.order_id });
                if (order) {
                    order.status = 'paid';
                    await this.orderRepository.save(order);
                }
            }

            return updatedPayment;
        } catch (error) {
            console.error('Error al actualizar pago:', error);
            throw new Error('Error al actualizar el pago');
        }
    }*/



}