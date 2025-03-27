import { Request, Response } from 'express';
import { AdminService } from '../Service/AdminService';

export class AdminController {
    private adminService = new AdminService();

    constructor() {
        this.getBannedUsers = this.getBannedUsers.bind(this);
        this.getUnbannedUsers = this.getUnbannedUsers.bind(this);
        this.banUser = this.banUser.bind(this);
        this.unbanUser = this.unbanUser.bind(this);
        this.getClients = this.getClients.bind(this);
        this.getSellers = this.getSellers.bind(this);
    }

    async getBannedUsers(req: Request, res: Response): Promise<Response> {
        try {
            const users = await this.adminService.getBannedUsers();
            return res.status(200).json(users);
        } catch (error) {
            return res.status(500).json({
                mensaje: 'Error al obtener usuarios baneados'
            });
        }
    }

    async getUnbannedUsers(req: Request, res: Response): Promise<Response> {
        try {
            const users = await this.adminService.getUnbannedUsers();
            return res.status(200).json(users);
        } catch (error) {
            return res.status(500).json({
                mensaje: 'Error al obtener usuarios no baneados'
            });
        }
    }

    async banUser(req: Request, res: Response): Promise<Response> {
        try {
            const { userId } = req.params;
            const { reason } = req.body;

            if (!reason) {
                return res.status(400).json({
                    mensaje: 'Se requiere una razón para banear al usuario'
                });
            }

            await this.adminService.banUser(Number(userId), reason);
            return res.status(200).json({
                mensaje: 'Usuario baneado exitosamente'
            });
        } catch (error) {
            return res.status(500).json({
                mensaje: 'Error al banear usuario'
            });
        }
    }

    async unbanUser(req: Request, res: Response): Promise<Response> {
        try {
            const { userId } = req.params;
            await this.adminService.unbanUser(Number(userId));
            return res.status(200).json({
                mensaje: 'Usuario desbaneado exitosamente'
            });
        } catch (error) {
            return res.status(500).json({
                mensaje: 'Error al desbanear usuario'
            });
        }
    }

    async getClients(req: Request, res: Response): Promise<Response> {
        try {
            const clients = await this.adminService.getClients();
            return res.status(200).json(clients);
        } catch (error) {
            return res.status(500).json({
                mensaje: 'Error al obtener clientes'
            });
        }
    }

    async getSellers(req: Request, res: Response): Promise<Response> {
        try {
            const sellers = await this.adminService.getSellers();
            return res.status(200).json(sellers);
        } catch (error) {
            return res.status(500).json({
                mensaje: 'Error al obtener vendedores'
            });
        }
    }
}