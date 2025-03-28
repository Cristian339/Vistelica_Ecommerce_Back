import {UserRegisterDTO} from "../DTO/UserRegisterDTO";
import {Role, User} from "../Entities/User";
import {Profile} from "../Entities/Profile";
import {AppDataSource} from "../Config/database";
import bcrypt from 'bcryptjs';
import {JWTService} from "./JWTService";
import {EmailService} from "./EmailService";

export class UserService {
    private userRepository = AppDataSource.getRepository(User);

    async createUser(data: UserRegisterDTO): Promise<User> {
        const existingEmail = await this.userRepository.findOne({
            where: {email: data.email}
        });

        if (existingEmail) {
            throw new Error('Este correo electrónico ya está registrado');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);

        const user = this.userRepository.create({
            email: data.email,
            password: hashedPassword,
            role: data.role || Role.CLIENTE
        });

        const savedUser = await this.userRepository.save(user);

        const profileRepository = AppDataSource.getRepository(Profile);
        const profile = profileRepository.create({
            user: savedUser,
            name: data.name,
            lastName: data.lastName,
            email: data.email,
            address: data.address,
            phone: data.phone,
            avatar: data.avatar,
            born_date: data.born_date
        });

        await profileRepository.save(profile);


        const result = await this.userRepository.findOne({
            where: {user_id: savedUser.user_id},
            relations: ['profile']
        });

        if (!result) {
            throw new Error('Error al crear el usuario');
        }

        return result;
    }

    async loadUserByEmail(email: string): Promise<User | undefined> {
        const user = await this.userRepository.findOne({where: {email}});
        return user || undefined;
    }

    async deleteAccount(password: string, token: string): Promise<void> {
        const user = await this.getUserFromToken(token);
        await this.verifyPassword(user, password);
        await this.userRepository.remove(user);
    }

    async changePassword(password: string, newPassword: string, token: string): Promise<void> {
        const user = await this.getUserFromToken(token);
        await this.verifyPassword(user, password);

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await this.userRepository.save(user);
    }


    private async getUserFromToken(token: string): Promise<User> {
        const jwtService = new JWTService();
        const profile = await jwtService.extractPerfilToken(token, this);
        const user = await this.userRepository.findOne({
            where: {user_id: profile.user.user_id}
        });

        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        return user;
    }


    private async verifyPassword(user: User, password: string): Promise<void> {
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Contraseña incorrecta');
        }
    }


    /**
     * Genera un token JWT para restablecer contraseña
     */
    async requestPasswordReset(email: string): Promise<string> {
        const user = await this.loadUserByEmail(email);
        if (!user) throw new Error('Usuario no encontrado');

        // Generar código de verificación de 6 dígitos
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Utilizar JWT para generar un token temporal
        const jwtService = new JWTService();
        const payload = {
            email: user.email,
            id: user.user_id,
            code: verificationCode,
            purpose: 'password-reset',
            timestamp: Date.now()
        };

        const emailService = new EmailService();
        await emailService.sendPasswordResetCode(user.email, verificationCode);

        return jwtService.generateResetToken(payload);
    }

    /**
     * Restablece la contraseña usando un token JWT
     */
    async resetPassword(token: string, code: string, newPassword: string): Promise<void> {
        try {
            const jwtService = new JWTService();
            const decoded = jwtService.verifyToken(token);

            // Verificar que el token sea para restablecer contraseña
            if (decoded.purpose !== 'password-reset') {
                throw new Error('Token inválido para restablecer contraseña');
            }

            if (decoded.code !== code) {
                throw new Error('Código de verificación incorrecto');
            }

            const user = await this.loadUserByEmail(decoded.email);
            if (!user) {
                throw new Error('Usuario no encontrado');
            }


            const isSamePassword = await bcrypt.compare(newPassword, user.password);
            if (isSamePassword) {
                throw new Error('La nueva contraseña no puede ser igual a la anterior');
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            await this.userRepository.save(user);
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Token inválido o expirado');
        }
    }






}