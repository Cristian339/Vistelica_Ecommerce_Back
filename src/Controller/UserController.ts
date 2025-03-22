// controllers/UserController.ts
import { Request, Response } from "express";
import { AppDataSource } from "../Config/database";
import { User } from "../Entities/User";

export class UserController {
    static async getAllUsers(req: Request, res: Response) {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const users = await userRepository.find();
            return res.json(users);
        } catch (error) {
            return res.status(500).json({ message: "Error al obtener usuarios", error });
        }
    }
}