import { Request, Response } from "express";
import { PaymentMethodService } from "../Service/PaymentMethodService";

export class PaymentMethodController {
    private paymentMethodService = new PaymentMethodService();

    async createPaymentMethod(req: Request, res: Response): Promise<Response> {
        try {
            const token = req.headers.authorization;

            if (!token) {
                return res.status(401).json({ message: "Token no proporcionado" });
            }

            const paymentMethod = await this.paymentMethodService.createPaymentMethod(req.body, token);

            return res.status(201).json({
                message: "Método de pago creado exitosamente",
                paymentMethod
            });
        } catch (error) {
            console.error("Error al crear método de pago:", error);
            return res.status(500).json({ message: "Error al crear método de pago", error: (error as Error).message });
        }
    }

    async getUserPaymentMethods(req: Request, res: Response): Promise<Response> {
        try {
            const token = req.headers.authorization;

            if (!token) {
                return res.status(401).json({ message: "Token no proporcionado" });
            }

            const paymentMethods = await this.paymentMethodService.getUserPaymentMethods(token);

            return res.status(200).json(paymentMethods);
        } catch (error) {
            return res.status(500).json({ message: "Error al obtener métodos de pago", error: (error as Error).message });
        }
    }

    async setDefaultPaymentMethod(req: Request, res: Response): Promise<Response> {
        try {
            const token = req.headers.authorization;
            const { methodId } = req.params;

            if (!token) {
                return res.status(401).json({ message: "Token no proporcionado" });
            }

            await this.paymentMethodService.setDefaultPaymentMethod(Number(methodId), token);

            return res.status(200).json({ message: "Método de pago establecido como predeterminado" });
        } catch (error) {
            return res.status(500).json({ message: "Error al actualizar método de pago", error: (error as Error).message });
        }
    }

    async deletePaymentMethod(req: Request, res: Response): Promise<Response> {
        try {
            const token = req.headers.authorization;
            const { methodId } = req.params;

            if (!token) {
                return res.status(401).json({ message: "Token no proporcionado" });
            }

            await this.paymentMethodService.deletePaymentMethod(Number(methodId), token);

            return res.status(200).json({ message: "Método de pago eliminado correctamente" });
        } catch (error) {
            return res.status(500).json({ message: "Error al eliminar método de pago", error: (error as Error).message });
        }
    }
}