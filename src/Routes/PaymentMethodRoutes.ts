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


router.post('/checkout', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const Stripe = require("stripe");
        const stripe = new Stripe("sk_test_51RPncWQc122Tani86S738hBqP3NJ2z0oyhC4Klj1NI0lUO0Ia69PGFGOhhrh7aF9lcXVpgqhIly3heO9Tcjs23s600Cx98TYxG");

        // Configuración base del PaymentIntent
        const paymentIntentParams: any = {
            amount: req.body.amount,
            currency: "eur",
            confirm: true,
            // ELIGE SOLO UNA DE ESTAS DOS OPCIONES:

            // Opción 1 (Recomendada para Google Pay):
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never'
            },
            use_stripe_sdk: true // Importante para Google Pay

            // O Opción 2 (Para control manual):
            // payment_method_types: ['card', 'google_pay']
        };

        // Si viene un payment_method (para pagos con tarjeta)
        if (req.body.id) {
            paymentIntentParams.payment_method = req.body.id;
        }

        // Crear el PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);


        // Manejar diferentes estados del pago
        switch (paymentIntent.status) {
            case 'succeeded':
                res.json({
                    success: true,
                    paymentIntent: paymentIntent.id,
                    amount_received: paymentIntent.amount_received
                });
                break;

            case 'requires_action':
                res.json({
                    success: true,
                    requires_action: true,
                    client_secret: paymentIntent.client_secret
                });
                break;

            default:
                res.status(400).json({
                    success: false,
                    message: `Estado de pago no manejado: ${paymentIntent.status}`,
                    status: paymentIntent.status
                });
        }
    } catch (error) {
        console.error('Error en el pago:', error);
        res.status(500).json({
            success: false,
            message: error
        });
    }
});


// Actualizar método de pago
router.put('/payment-methods/:methodId',
    (req: Request, res: Response, next: NextFunction) => {

        auth.authenticate(req, res, next);
    },
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await paymentMethodController.updatePaymentMethod(req, res);
        } catch (error) {
            next(error);
        }
    }
);

export default router;