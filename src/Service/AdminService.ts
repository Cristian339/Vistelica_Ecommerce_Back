import {Repository} from "typeorm";
import {Role, User} from "../Entities/User";
import { AppDataSource } from "../Config/database";


export class AdminService {
    private userRepository: Repository<User>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
    }

    // Listar usuarios baneados
    async getBannedUsers(): Promise<User[]> {
        return await this.userRepository.find({
            where: { banned: true }
        });
    }

    // Listar usuarios no baneados
    async getUnbannedUsers(): Promise<User[]> {
        return await this.userRepository.find({
            where: { banned: false }
        });
    }

    // Resto de tus métodos existentes...
    async banUser(userId: number, reason: string): Promise<void> {
        await this.userRepository.update(userId, {
            banned: true,
            banned_at: new Date(),
            ban_reason: reason
        });
    }

    async unbanUser(userId: number): Promise<void> {
        await this.userRepository.update(userId, {
            banned: false,
            banned_at: null,
            ban_reason: null
        });
    }

    // Listar clientes
    async getClients(): Promise<User[]> {
        return await this.userRepository.find({
            where: { role: Role.CLIENTE }
        });
    }

    // Listar Proveedores
    async getSellers(): Promise<User[]> {
        return await this.userRepository.find({
            where: { role: Role.VENDEDOR }
        });
    }

}