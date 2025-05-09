import { Request, Response } from 'express';
import { AddressService } from '../Service/AddressService';

export class AddressController {
    private addressService: AddressService;

    constructor() {
        this.addressService = new AddressService();
    }

    // Obtener todas las direcciones del usuario
    async getAddresses(req: Request, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    success: false,
                    message: "Usuario no autenticado"
                });
            }

            const addresses = await this.addressService.getAddresses(req.user.id);
            return res.status(200).json({
                success: true,
                data: addresses
            });
        } catch (error) {
            console.error("Error al obtener direcciones:", error);
            return res.status(500).json({
                success: false,
                message: "Error al procesar la solicitud"
            });
        }
    }

    // Agregar nueva dirección
    async addAddress(req: Request, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    success: false,
                    message: "Usuario no autenticado"
                });
            }

            const result = await this.addressService.addAddress(req.body, req.user.id);

            if (result.success) {
                return res.status(201).json({
                    success: true,
                    data: result.data,
                    message: result.message || "Dirección agregada correctamente"
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: result.message || "No se pudo agregar la dirección"
                });
            }
        } catch (error) {
            console.error("Error al agregar dirección:", error);
            return res.status(500).json({
                success: false,
                message: "Error al procesar la solicitud"
            });
        }
    }

    // Actualizar dirección existente
    async updateAddress(req: Request, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    success: false,
                    message: "Usuario no autenticado"
                });
            }

            const { id } = req.params;
            const updatedAddress = await this.addressService.updateAddress(
                parseInt(id),
                req.body,
                req.user.id
            );

            if (!updatedAddress) {
                return res.status(404).json({
                    success: false,
                    message: "Dirección no encontrada"
                });
            }

            return res.status(200).json({
                success: true,
                data: updatedAddress,
                message: "Dirección actualizada correctamente"
            });
        } catch (error) {
            console.error("Error al actualizar dirección:", error);
            return res.status(500).json({
                success: false,
                message: "Error al procesar la solicitud"
            });
        }
    }

    // Eliminar dirección
    async deleteAddress(req: Request, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    success: false,
                    message: "Usuario no autenticado"
                });
            }

            const { id } = req.params;
            const success = await this.addressService.deleteAddress(
                parseInt(id),
                req.user.id
            );

            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: "Dirección no encontrada o no se pudo eliminar"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Dirección eliminada correctamente"
            });
        } catch (error) {
            console.error("Error al eliminar dirección:", error);
            return res.status(500).json({
                success: false,
                message: "Error al procesar la solicitud"
            });
        }
    }

    // Establecer como dirección predeterminada
    async setDefaultAddress(req: Request, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    success: false,
                    message: "Usuario no autenticado"
                });
            }

            const { id } = req.params;
            const success = await this.addressService.setDefaultAddress(
                parseInt(id),
                req.user.id
            );

            if (!success) {
                return res.status(404).json({
                    success: false,
                    message: "Dirección no encontrada"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Dirección establecida como predeterminada"
            });
        } catch (error) {
            console.error("Error al establecer dirección predeterminada:", error);
            return res.status(500).json({
                success: false,
                message: "Error al procesar la solicitud"
            });
        }
    }


    // Obtener la dirección predeterminada
    async getDefaultAddress(req: Request, res: Response) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    success: false,
                    message: "Usuario no autenticado"
                });
            }

            const defaultAddress = await this.addressService.getDefaultAddress(req.user.id);

            if (!defaultAddress) {
                return res.status(404).json({
                    success: false,
                    message: "No se encontró dirección predeterminada"
                });
            }

            return res.status(200).json({
                success: true,
                data: defaultAddress
            });
        } catch (error) {
            console.error("Error al obtener dirección predeterminada:", error);
            return res.status(500).json({
                success: false,
                message: "Error al procesar la solicitud"
            });
        }
    }

}