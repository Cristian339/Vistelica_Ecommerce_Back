import { Request, Response } from 'express';
import { ShoppingCartDetailService } from '../Service/ShoppingCartDetailService';

export class ShoppingCartController {
    private orderDetailService: ShoppingCartDetailService;

    constructor() {
        this.orderDetailService = new ShoppingCartDetailService();
    }

    // Añadir un producto al carrito
    async addProductToOrder(req: Request, res: Response): Promise<void> {
        const { orderId, productId, quantity, price, size, color, discount_percentage } = req.body;

        if (!orderId || !productId || !quantity || !price) {
            res.status(400).json({
                success: false,
                message: 'Datos incompletos. Se requieren orderId, productId, quantity y price'
            });
            return;
        }

        try {
            const orderDetail = await this.orderDetailService.addProductToOrder(
                orderId,
                productId,
                quantity,
                price,
                size,
                color,
                discount_percentage || null
            );

            res.status(201).json({
                success: true,
                message: 'Producto agregado al carrito correctamente',
                data: orderDetail
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al agregar producto al carrito',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Eliminar un producto del carrito
    async removeProductFromOrder(req: Request, res: Response): Promise<void> {
        const { itemId } = req.params;

        if (!itemId || isNaN(parseInt(itemId))) {
            res.status(400).json({
                success: false,
                message: 'ID de detalle de pedido inválido o faltante'
            });
            return;
        }

        try {
            await this.orderDetailService.removeProductFromOrder(parseInt(itemId));
            res.status(200).json({
                success: true,
                message: 'Producto eliminado del carrito correctamente'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al eliminar producto del carrito',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Obtener los detalles de un pedido
    async getOrderDetails(req: Request, res: Response): Promise<void> {
        const { orderId } = req.params;

        if (!orderId || isNaN(parseInt(orderId))) {
            res.status(400).json({
                success: false,
                message: 'ID de pedido inválido o faltante'
            });
            return;
        }

        try {
            const orderDetails = await this.orderDetailService.getOrderDetails(parseInt(orderId));

            if (orderDetails.length === 0) {
                res.status(404).json({
                    success: false,
                    message: 'No se encontraron productos en este carrito'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Detalles del carrito obtenidos correctamente',
                data: orderDetails
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener los detalles del carrito',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    // Actualizar la cantidad de un producto en el carrito
    async updateOrderDetailQuantity(req: Request, res: Response): Promise<void> {
        const { itemId } = req.params;
        const { quantity } = req.body;

        try {
            const cartDetail = await this.orderDetailService.updateOrderDetailQuantity(
                parseInt(itemId),
                quantity
            );

            res.status(200).json({
                success: true,
                message: 'Cantidad actualizada correctamente',
                data: cartDetail
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al actualizar la cantidad del producto',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    async getCartTotal(req: Request, res: Response): Promise<void> {
        const { userId, sessionId } = req.query;

        try {
            if (!userId && !sessionId) {
                res.status(400).json({
                    success: false,
                    message: 'Se requiere userId o sessionId'
                });
                return;
            }

            const result = await this.orderDetailService.calculateTotalPrice(
                userId ? Number(userId) : undefined,
                sessionId as string | undefined
            );

            res.status(200).json({

                originalTotal: result.totalPrice,
                discountedTotal: result.discountedTotal,
                totalSavings: result.totalSavings,
                itemCount: result.itemCount,
                items: result.cartDetails.map(item => {
                    const price = parseFloat(item.price.toString());
                    const discount = item.discount_percentage ? parseFloat(item.discount_percentage.toString()) : 0;
                    const discountedPrice = discount > 0 ? price * (1 - discount / 100) : price;

                    return {
                        productId: item.product?.product_id,
                        name: item.product?.name,
                        quantity: item.quantity,
                        originalPrice: price,
                        discountPercentage: discount,
                        discountedPrice: parseFloat(discountedPrice.toFixed(2)),
                        subtotal: parseFloat((discountedPrice * item.quantity).toFixed(2)),
                        savings: parseFloat(((price - discountedPrice) * item.quantity).toFixed(2))
                    }
                })

            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al calcular el total del carrito',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }
}