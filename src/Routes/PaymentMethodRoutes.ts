import express, { Request, Response, NextFunction } from "express";
import { PaymentMethodController } from "../Controller/PaymentMethodController";
import { Auth } from "../Middleware/Auth";

const router = express.Router();
const paymentMethodController = new PaymentMethodController();
const auth = new Auth();

// Crear método de pago
router.post('/payment-methods',
    (req: Request, res: Response, next: NextFunction) => {
        auth.authenticate(req, res, next);
    },
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await paymentMethodController.createPaymentMethod(req, res);
        } catch (error) {
            next(error);
        }
    }
);

// Obtener métodos de pago del usuario
router.get('/payment-methods',
    (req: Request, res: Response, next: NextFunction) => {
        auth.authenticate(req, res, next);
    },
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await paymentMethodController.getUserPaymentMethods(req, res);
        } catch (error) {
            next(error);
        }
    }
);

// Establecer método de pago predeterminado
router.put('/payment-methods/:methodId/default',
    (req: Request, res: Response, next: NextFunction) => {
        auth.authenticate(req, res, next);
    },
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await paymentMethodController.setDefaultPaymentMethod(req, res);
        } catch (error) {
            next(error);
        }
    }
);

// Eliminar método de pago
router.delete('/payment-methods/:methodId',
    (req: Request, res: Response, next: NextFunction) => {
        auth.authenticate(req, res, next);
    },
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await paymentMethodController.deletePaymentMethod(req, res);
        } catch (error) {
            next(error);
        }
    }
);

export default router;