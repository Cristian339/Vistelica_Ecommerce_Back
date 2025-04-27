import { Request, Response } from "express";
import { UserService } from "../Service/UserService";
import {User} from "../Entities/User";
import {AppDataSource} from "../Config/database";

export class ProfileController {
    private userService = new UserService();

    constructor() {
        this.deleteAccount = this.deleteAccount.bind(this);
    }

    async deleteAccount(req: Request, res: Response): Promise<Response> {
        try {
            const { password } = req.body;

            if (!password) {
                return res.status(400).json({ message: "La contraseña es obligatoria" });
            }

            // El middleware ya verificó el token, así que podemos asumirlo como válido
            const token = req.headers.authorization;
            await this.userService.deleteAccount(password, token as string);
            return res.status(200).json({ message: "Cuenta eliminada exitosamente" });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({ message: "Error al eliminar cuenta" });
        }
    }

    async changePassword(req: Request, res: Response): Promise<Response> {
        try {
            const { oldPassword, newPassword } = req.body;

            if (!oldPassword || !newPassword) {
                return res.status(400).json({ message: "La contraseña es obligatoria" });
            }

            if (oldPassword === newPassword) {
                return res.status(400).json({ message: "La nueva contraseña no puede ser igual a la anterior" });
            }

            const token = req.headers.authorization;
            await this.userService.changePassword(oldPassword, newPassword, token as string);
            return res.status(200).json({ message: "Contraseña actualizada exitosamente" });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({ message: "Error al actualizar contraseña" });
        }

    }
    async getUserProfile(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = (req as any).user;
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ message: "ID de usuario no válido" });
            }

            const user = await AppDataSource.getRepository(User).findOne({
                where: { user_id: Number(id) },
                relations: ["profile"],
            });

            if (!user || !user.profile) {
                return res.status(404).json({ message: "Perfil no encontrado para este usuario" });
            }

            return res.status(200).json(user.profile);
        } catch (error) {
            console.error("Error al obtener el perfil del usuario:", error);
            return res.status(500).json({ message: "Error al obtener el perfil", error: (error as Error).message });
        }
    }



}