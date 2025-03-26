import { Request, Response } from 'express';
import { ShoppingCartService } from '../Service/ShoppingCartService';
import {Order} from "../Entities/Order";
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';
export class ShoppingCartDetailController {
    private orderService: ShoppingCartService;

    constructor() {
        this.orderService = new ShoppingCartService();
    }

    // Crear un nuevo pedido (ahora recibe userId y sessionId desde el body)
    async createOrder(req: Request, res: Response): Promise<void> {
        const { userId, sessionId } = req.body;

        try {
            let order: Order;

            if (userId) {
                // Usuario autenticado
                order = await this.orderService.createOrder(userId);
            } else if (sessionId) {
                // Usuario no autenticado con sessionId
                const existingOrder = await this.orderService.getOrderBySessionId(sessionId);

                if (existingOrder) {
                    order = existingOrder;
                } else {
                    order = await this.orderService.createOrder(undefined, sessionId);
                }
            } else {
                // Usuario completamente nuevo sin sessionId
                const newSessionId = uuidv4();
                order = await this.orderService.createOrder(undefined, newSessionId);

                res.status(201)
                    .cookie('sessionId', newSessionId, {
                        httpOnly: true,
                        maxAge: 30 * 24 * 60 * 60 * 1000
                    })
                    .json({ order, sessionId: newSessionId });
                return;
            }

            res.status(201).json(order);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    }

    // Obtener el carrito actual (recibe userId o sessionId desde query params)
    async getCurrentOrder(req: Request, res: Response): Promise<void> {
        const { userId, sessionId } = req.query;

        try {
            let order: Order | null = null;

            if (userId) {
                order = await this.orderService.getOrderByUserId(Number(userId));
            } else if (sessionId) {
                order = await this.orderService.getOrderBySessionId(sessionId as string);
            }

            if (!order) {
                res.status(404).json({ message: 'No active order found' });
                return;
            }

            res.status(200).json(order);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    }

    // Asociar carrito a usuario (recibe todo desde el body)
    async associateOrderToUser(req: Request, res: Response): Promise<void> {
        const { orderId, userId, sessionId } = req.body;

        try {
            if (!userId) {
                res.status(401).json({ message: 'User ID is required' });
                return;
            }

            const order = await this.orderService.getOrderById(orderId);
            if (!order) {
                res.status(404).json({ message: 'Order not found' });
                return;
            }

            if (!order.user && order.session_id !== sessionId) {
                res.status(403).json({ message: 'Not authorized to access this order' });
                return;
            }

            const updatedOrder = await this.orderService.associateOrderToUser(orderId, userId);
            res.status(200).json(updatedOrder);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    }

    // Actualizar el estado de un pedido
    async updateOrderStatus(req: Request, res: Response): Promise<void> {
        const { orderId } = req.params;
        const { status } = req.body;
        try {
            const order = await this.orderService.updateOrderStatus(parseInt(orderId), status);
            res.status(200).json(order);
        } catch (error) {
            // @ts-ignore
            res.status(500).json({ message: error.message });
        }
    }

    // En OrderController, añade este método si no existe
    async getOrderById(req: Request, res: Response): Promise<void> {
        const { orderId } = req.params;
        try {
            const order = await this.orderService.getOrderById(parseInt(orderId));
            if (!order) {
                res.status(404).json({ message: 'Order not found' });
                return;
            }
            res.status(200).json(order);
        } catch (error) {
            res.status(500).json({ message: (error as Error).message });
        }
    }

    // Eliminar un pedido por su ID
    async deleteOrder(req: Request, res: Response): Promise<void> {
        const { orderId } = req.params;
        try {
            const order = await this.orderService.deleteOrder(parseInt(orderId));
            res.status(200).json({ message: 'Order deleted successfully', order });
        } catch (error) {
            // @ts-ignore
            res.status(500).json({ message: error.message });
        }
    }
}