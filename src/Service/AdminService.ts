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
            ban_reason: reason
        });
    }



    async tempBanUser(userId: number, reason: string, days: number): Promise<void> {
        if (days < 3 || days > 10) {
            throw new Error("El baneo temporal debe ser entre 3 y 10 días");
        }

        const banStart = new Date();
        await this.userRepository.update(userId, {
            banned: true,
            banned_at: banStart,
            ban_reason: `${reason} (Baneo temporal por ${days} días)`
        });

        // Programar desbaneo automático
        this.scheduleUnban(userId, banStart, days);
    }

    private scheduleUnban(userId: number, banStart: Date, days: number): void {
        const banDurationMs = days * 24 * 60 * 60 * 1000;
        const banEnd = new Date(banStart.getTime() + banDurationMs);

        // Solo programar si el baneo no ha expirado
        if (banEnd > new Date()) {
            setTimeout(async () => {
                try {
                    await this.unbanUserIfStillBanned(userId, banStart);
                } catch (error) {
                    console.error(`Error al desbanear automáticamente al usuario ${userId}:`, error);
                }
            }, banDurationMs);
        }
    }

    private async unbanUserIfStillBanned(userId: number, originalBanDate: Date): Promise<void> {
        const user = await this.userRepository.findOneBy({ user_id: userId });

        if (user && user.banned && user.banned_at?.getTime() === originalBanDate.getTime()) {
            await this.unbanUser(userId);
            console.log(`Usuario ${userId} desbaneado automáticamente`);
        }
    }

    async checkExpiredBans(): Promise<void> {
        const now = new Date();
        // Calcular la fecha más antigua para baneos de 10 días (el máximo)
        const tenDaysAgo = new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000));

        const users = await this.userRepository.createQueryBuilder("user")
            .where("user.banned = :banned", { banned: true })
            .andWhere("user.banned_at BETWEEN :tenDaysAgo AND :now", {
                tenDaysAgo,
                now: new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000)) // Mínimo 3 días
            })
            .getMany();

        for (const user of users) {
            if (user.banned_at) {
                // Calcular si el baneo ya expiró (3-10 días desde banned_at)
                const banDays = Math.floor((now.getTime() - user.banned_at.getTime()) / (24 * 60 * 60 * 1000));
                if (banDays >= 3) { // Asumimos que el baneo mínimo es de 3 días
                    await this.unbanUser(user.user_id);
                    console.log(`Usuario ${user.user_id} desbaneado automáticamente (baneo expirado)`);
                }
            }
        }
    }


    async unbanUser(userId: number): Promise<void> {
        await this.userRepository.update(userId, {
            banned: false,
            banned_at: null,
            ban_reason: null
        });
    }

    // Listar clientes con información de perfil
    async getClients(): Promise<User[]> {
        return await this.userRepository.find({
            where: { role: Role.CLIENTE },
            relations: ['profile'], // Cargar la relación con el perfil
            select: {
                user_id: true,
                email: true,
                role: true,
                banned: true,
                banned_at: true,
                ban_reason: true,
                profile: {
                    name: true,
                    lastName: true
                }
            }
        });
    }

    // Listar Proveedores
    async getSellers(): Promise<User[]> {
        return await this.userRepository.find({
            where: { role: Role.VENDEDOR }
        });
    }

}