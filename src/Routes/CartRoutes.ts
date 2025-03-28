import express, { Router, Request, Response, NextFunction } from 'express';
import { ShoppingCartController } from '../Controller/ShoppingCartController';
import { ShoppingCartDetailController } from '../Controller/ShoppingCartDetailController';
import { Auth } from '../Middleware/Auth';

const router: Router = express.Router();
const shoppingCartDetailController = new ShoppingCartDetailController();
const shoppingCartController = new ShoppingCartController();
const auth = new Auth();

// Rutas principales del carrito
router.post('/cart/', (req: Request, res: Response, next: NextFunction) => {
    auth.authenticate(req, res, next);
}, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await shoppingCartDetailController.createOrder(req, res);
    } catch (error) {
        next(error);
    }
});

router.get('/cart/', (req: Request, res: Response, next: NextFunction) => {
    auth.authenticate(req, res, next);
}, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await shoppingCartDetailController.getCurrentOrder(req, res);
    } catch (error) {
        next(error);
    }
});

router.post('/cart/associate', (req: Request, res: Response, next: NextFunction) => {
    auth.authenticate(req, res, next);
}, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await shoppingCartDetailController.associateOrderToUser(req, res);
    } catch (error) {
        next(error);
    }
});

// Rutas para items del carrito
router.post('/cart/items', (req: Request, res: Response, next: NextFunction) => {
    auth.authenticate(req, res, next);
}, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await shoppingCartController.addProductToOrder(req, res);
    } catch (error) {
        next(error);
    }
});

router.get('/cart/items/:orderId', (req: Request, res: Response, next: NextFunction) => {
    auth.authenticate(req, res, next);
}, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await shoppingCartController.getOrderDetails(req, res);
    } catch (error) {
        next(error);
    }
});

router.put('/cart/items/:itemId/quantity', (req: Request, res: Response, next: NextFunction) => {
    auth.authenticate(req, res, next);
}, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await shoppingCartController.updateOrderDetailQuantity(req, res);
    } catch (error) {
        next(error);
    }
});

router.delete('/cart/items/:itemId', (req: Request, res: Response, next: NextFunction) => {
    auth.authenticate(req, res, next);
}, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await shoppingCartController.removeProductFromOrder(req, res);
    } catch (error) {
        next(error);
    }
});

// Ruta para obtener el total del carrito
router.get('/cart/total', (req: Request, res: Response, next: NextFunction) => {
    auth.authenticate(req, res, next);
}, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await shoppingCartController.getCartTotal(req, res);
    } catch (error) {
        next(error);
    }
});

export default router;