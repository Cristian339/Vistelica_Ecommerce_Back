import jwt from 'jsonwebtoken';
import {User} from '../Entities/User';
import {DecodedTokenDTO} from "../DTO/DecodedTokenDTO";
import {AppDataSource} from "../Config/database";
import {Profile} from "../Entities/Profile";

export class JWTService {
    private readonly SECRET_KEY: string = "AIV245YYmIRCEDVzu6RTiDasGyk7aPuKc8EG0bkxkZZ8VGwBMIFYU0DX5HAHHseT";

    generateToken(user: User): string {
        const payload = {
            id: user.user_id,
            email: user.email
        };

        return jwt.sign(payload, this.SECRET_KEY, {expiresIn: '3h'});
    }

    verifyToken(token: string): any {
        try {
            return jwt.verify(token, this.SECRET_KEY);
        } catch (error) {
            throw new Error('Token inválido o expirado');
        }
    }

    decodeToken(token: string): any {
        return jwt.decode(token);
    }

    async extractPerfilToken(token: string, userService: any): Promise<Profile> {
        try {
            if (!AppDataSource.isInitialized) {
                console.log("Inicializando AppDataSource...");
                await AppDataSource.initialize();
                console.log("AppDataSource inicializado correctamente");
            }

            const tokenWithoutHeader = token.substring(7);
            const decodedToken = this.verifyToken(tokenWithoutHeader);
            const tokenData = new DecodedTokenDTO(decodedToken);

            if (!tokenData.email) {
                throw new Error('Email no encontrado en el token');
            }

            const user = await userService.loadUserByEmail(tokenData.email);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }
            console.log("Usuario encontrado:", user);
            console.log("Buscando perfil para user_id:", user.user_id);

            const profileRepository = AppDataSource.getRepository(Profile);

            console.log("Ejecutando consulta con ID:", user.user_id);
            const profile = await profileRepository.findOne({
                where: { user: { user_id: user.user_id } },
                relations: ["user"]
            });

            console.log("Resultado de la consulta:", profile);

            if (!profile) {
                throw new Error('Perfil no encontrado para el usuario con ID: ' + user.user_id);
            }

            return profile;
        } catch (error: unknown) {
            console.error("Error completo:", error);
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            throw new Error('Error al extraer datos del token: ' + errorMessage);
        }
    }

    generateResetToken(payload: any): string {
        return jwt.sign(payload, this.SECRET_KEY, {expiresIn: '1h'});
    }
}