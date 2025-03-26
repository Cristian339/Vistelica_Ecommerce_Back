import express from 'express';
import { ShoppingCartController } from '../Controller/ShoppingCartController';
import { ShoppingCartDetailService} from "../Service/ShoppingCartDetailService";

const router = express.Router();
const orderController = new ShoppingCartDetailService();
const orderDetailController = new ShoppingCartController();

// Rutas para Order (Carrito)
router.post('/order', orderController.createOrder.bind(orderController)); // Crear nuevo carrito
router.get('/order', orderController.getCurrentOrder.bind(orderController)); // Obtener carrito actual
router.post('/order/associate', orderController.associateOrderToUser.bind(orderController)); // Asociar carrito a usuario

// Rutas para OrderDetail (Items del carrito)
router.post('/orderD/items', orderDetailController.addProductToOrder.bind(orderDetailController)); // Añadir producto
router.get('/orderD/items', orderDetailController.getOrderDetails.bind(orderDetailController)); // Listar productos
router.put('/orderD/items/:orderDetailId/quantity', orderDetailController.updateOrderDetailQuantity.bind(orderDetailController)); // Actualizar cantidad
router.delete('/orderD/items/:orderDetailId', orderDetailController.removeProductFromOrder.bind(orderDetailController)); // Eliminar producto

// Rutas para gestión de pedidos completos (solo para usuarios autenticados)
router.get('/orders/:orderId', orderController.getOrderById.bind(orderController)); // Ver pedido específico
router.put('/orders/:orderId/status', orderController.updateOrderStatus.bind(orderController)); // Actualizar estado
router.delete('/orders/:orderId', orderController.deleteOrder.bind(orderController)); // Eliminar pedido

export default router;