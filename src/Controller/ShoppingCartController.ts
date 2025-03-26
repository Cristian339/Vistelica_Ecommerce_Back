import { Request, Response } from 'express';
import { ShoppingCartDetailService } from '../Service/ShoppingCartDetailService';

export class ShoppingCartController {
    private orderDetailService: ShoppingCartDetailService;

    constructor() {
        this.orderDetailService = new ShoppingCartDetailService();
    }

    // Añadir un producto al carrito (OrderDetail)
    async addProductToOrder(req: Request, res: Response): Promise<void> {
        const { orderId, productId, quantity, price } = req.body;
        try {
            const orderDetail = await this.orderDetailService.addProductToOrder(orderId, productId, quantity, price);
            res.status(201).json(orderDetail);
        } catch (error) {
            // @ts-ignore
            res.status(500).json({ message: error.message });
        }
    }

    // Eliminar un producto del carrito (OrderDetail)
    async removeProductFromOrder(req: Request, res: Response): Promise<void> {
        const { orderDetailId } = req.params;
        try {
            await this.orderDetailService.removeProductFromOrder(parseInt(orderDetailId));
            res.status(200).json({ message: 'Product removed from order successfully' });
        } catch (error) {
            // @ts-ignore
            res.status(500).json({ message: error.message });
        }
    }

    // Obtener los detalles de un pedido (OrderDetails)
    async getOrderDetails(req: Request, res: Response): Promise<void> {
        const { orderId } = req.params;
        try {
            const orderDetails = await this.orderDetailService.getOrderDetails(parseInt(orderId));
            res.status(200).json(orderDetails);
        } catch (error) {
            // @ts-ignore
            res.status(500).json({ message: error.message });
        }
    }

    // Actualizar la cantidad de un producto en el carrito (OrderDetail)
    async updateOrderDetailQuantity(req: Request, res: Response): Promise<void> {
        const { orderDetailId } = req.params;
        const { quantity } = req.body;
        try {
            const orderDetail = await this.orderDetailService.updateOrderDetailQuantity(parseInt(orderDetailId), quantity);
            res.status(200).json(orderDetail);
        } catch (error) {
            // @ts-ignore
            res.status(500).json({ message: error.message });
        }
    }
}