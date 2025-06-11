import { Request, Response } from "express";
import { PaymentMethodService } from "../Service/PaymentMethodService";

export class PaymentMethodController {
    private paymentMethodService: PaymentMethodService;

    constructor() {
        this.paymentMethodService = new PaymentMethodService();
    }

    async createPaymentMethod(req: Request, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    success: false,
                    message: "Usuario no autenticado"
                });
            }

            const result = await this.paymentMethodService.createPaymentMethod(req.body, req.user.id);

            if (!result.success) {
                return res.status(400).json(result);
            }

            return res.status(201).json({
                success: true,
                data: result.data,
                message: result.message || "Método de pago creado exitosamente"
            });
        } catch (error) {
            console.error("Error al crear método de pago:", error);
            return res.status(500).json({
                success: false,
                message: "Error al procesar la solicitud"
            });
        }
    }

    async getUserPaymentMethods(req: Request, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    success: false,
                    message: "Usuario no autenticado"
                });
            }

            const paymentMethods = await this.paymentMethodService.getUserPaymentMethods(req.user.id);

            return res.status(200).json({
                success: true,
                data: paymentMethods
            });
        } catch (error) {
            console.error("Error al obtener métodos de pago:", error);
            return res.status(500).json({
                success: false,
                message: "Error al procesar la solicitud"
            });
        }
    }


    /**
     * Obtiene el método de pago por defecto del usuario (con número de tarjeta)
     */
    async getDefaultPaymentMethod(req: Request, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    success: false,
                    message: "Usuario no autenticado"
                });
            }

            const method = await this.paymentMethodService.getDefaultPaymentMethodWithCardNumber(req.user.id);

            if (!method) {
                return res.status(404).json({
                    success: false,
                    message: "No se encontró método de pago por defecto"
                });
            }

            return res.status(200).json({
                success: true,
                data: method
            });
        } catch (error) {
            console.error("Error al obtener método de pago por defecto:", error);
            return res.status(500).json({
                success: false,
                message: "Error al procesar la solicitud"
            });
        }
    }

    async setDefaultPaymentMethod(req: Request, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    success: false,
                    message: "Usuario no autenticado"
                });
            }

            const { methodId } = req.params;
            const result = await this.paymentMethodService.setDefaultPaymentMethod(
                Number(methodId),
                req.user.id
            );

            if (!result.success) {
                return res.status(400).json(result);
            }

            return res.status(200).json({
                success: true,
                data: result.data,
                message: "Método de pago establecido como predeterminado"
            });
        } catch (error) {
            console.error("Error al actualizar método de pago:", error);
            return res.status(500).json({
                success: false,
                message: "Error al procesar la solicitud"
            });
        }
    }

    async deletePaymentMethod(req: Request, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    success: false,
                    message: "Usuario no autenticado"
                });
            }

            const { methodId } = req.params;
            const result = await this.paymentMethodService.deletePaymentMethod(
                Number(methodId),
                req.user.id
            );

            if (!result.success) {
                return res.status(400).json(result);
            }

            return res.status(200).json({
                success: true,
                message: "Método de pago eliminado correctamente"
            });
        } catch (error) {
            console.error("Error al eliminar método de pago:", error);
            return res.status(500).json({
                success: false,
                message: "Error al procesar la solicitud"
            });
        }
    }


    async updatePaymentMethod(req: Request, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    success: false,
                    message: "Usuario no autenticado"
                });
            }

            const { methodId } = req.params;
            const result = await this.paymentMethodService.updatePaymentMethod(
                Number(methodId),
                req.user.id,
                req.body
            );

            if (!result.success) {
                return res.status(400).json(result);
            }

            return res.status(200).json({
                success: true,
                data: result.data,
                message: result.message || "Método de pago actualizado correctamente"
            });
        } catch (error) {
            console.error("Error al actualizar método de pago:", error);
            return res.status(500).json({
                success: false,
                message: "Error al procesar la solicitud"
            });
        }
    }
}