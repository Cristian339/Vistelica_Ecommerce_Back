import { Request, Response } from 'express';
import { ShoppingCartService } from '../Service/ShoppingCartService';
import { Order } from "../Entities/Order";
// @ts-ignore
import { v4 as uuidv4 } from 'uuid';

export class ShoppingCartDetailController {
    private orderService: ShoppingCartService;

    constructor() {
        this.orderService = new ShoppingCartService();
    }

    // Crear un nuevo pedido (carrito)
    async createOrder(req: Request, res: Response): Promise<void> {
        const { userId, sessionId } = req.body;

        try {
            let order: Order | null;

            if (userId) {
                // Usuario autenticado
                order = await this.orderService.createOrder(userId);
                res.status(201).json({
                    success: true,
                    message: 'Carrito creado exitosamente para usuario registrado',
                    data: order
                });
                return;
            }

            // Usuario no autenticado
            if (sessionId) {
                const existingOrder = await this.orderService.getOrderBySessionId(sessionId);
                if (existingOrder) {
                    res.status(200).json({
                        success: true,
                        message: 'Carrito existente recuperado',
                        data: existingOrder
                    });
                    return;
                }
                order = await this.orderService.createOrder(undefined, sessionId);
                res.status(201).json({
                    success: true,
                    message: 'Carrito creado exitosamente con sesión existente',
                    data: order
                });
                return;
            }

            // Nuevo usuario sin sesión
            const newSessionId = uuidv4();
            order = await this.orderService.createOrder(undefined, newSessionId);

            res.status(201)
                .cookie('sessionId', newSessionId, {
                    httpOnly: true,
                    maxAge: 30 * 24 * 60 * 60 * 1000
                })
                .json({
                    success: true,
                    message: 'Nuevo carrito creado con nueva sesión',
                    data: order,
                    sessionId: newSessionId
                });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al crear el carrito',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Obtener el carrito actual
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
                res.status(404).json({
                    success: false,
                    message: userId ? 'No se encontró carrito activo para este usuario'
                        : 'No se encontró carrito para esta sesión'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Carrito obtenido exitosamente',
                data: order
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener el carrito',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Asociar carrito a usuario
    async associateOrderToUser(req: Request, res: Response): Promise<void> {
        const { orderId, userId, sessionId } = req.body;

        try {
            if (!userId) {
                res.status(400).json({
                    success: false,
                    message: 'Se requiere el ID de usuario'
                });
                return;
            }

            const order = await this.orderService.getOrderById(orderId);
            if (!order) {
                res.status(404).json({
                    success: false,
                    message: 'No se encontró el carrito especificado'
                });
                return;
            }

            if (!order.user && order.session_id !== sessionId) {
                res.status(403).json({
                    success: false,
                    message: 'No autorizado para acceder a este carrito'
                });
                return;
            }

            const updatedOrder = await this.orderService.associateOrderToUser(orderId, userId);
            res.status(200).json({
                success: true,
                message: 'Carrito asociado al usuario exitosamente',
                data: updatedOrder
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al asociar carrito al usuario',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Actualizar estado del pedido
    async updateOrderStatus(req: Request, res: Response): Promise<void> {
        const { orderId } = req.params;
        const { status } = req.body;

        if (!status) {
            res.status(400).json({
                success: false,
                message: 'El nuevo estado es requerido'
            });
            return;
        }

        try {
            const order = await this.orderService.updateOrderStatus(parseInt(orderId), status);
            res.status(200).json({
                success: true,
                message: 'Estado del carrito actualizado exitosamente',
                data: order
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al actualizar el estado del carrito',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Obtener pedido por ID
    async getOrderById(req: Request, res: Response): Promise<void> {
        const { orderId } = req.params;

        if (!orderId || isNaN(parseInt(orderId))) {
            res.status(400).json({
                success: false,
                message: 'ID de carrito inválido'
            });
            return;
        }

        try {
            const order = await this.orderService.getOrderById(parseInt(orderId));
            if (!order) {
                res.status(404).json({
                    success: false,
                    message: 'No se encontró el carrito solicitado'
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Carrito obtenido exitosamente',
                data: order
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener el carrito',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Eliminar un pedido
    async deleteOrder(req: Request, res: Response): Promise<void> {
        const { orderId } = req.params;

        if (!orderId || isNaN(parseInt(orderId))) {
            res.status(400).json({
                success: false,
                message: 'ID de carrito inválido'
            });
            return;
        }

        try {
            const order = await this.orderService.deleteOrder(parseInt(orderId));
            res.status(200).json({
                success: true,
                message: 'Carrito eliminado exitosamente',
                data: order
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al eliminar el carrito'
            });
        }
    }
}