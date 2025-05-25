import {UserRegisterDTO} from "../DTO/UserRegisterDTO";
import {Role, User} from "../Entities/User";
import {Profile} from "../Entities/Profile";
import {AppDataSource} from "../Config/database";
import bcrypt from 'bcryptjs';
import {JWTService} from "./JWTService";
import {EmailService} from "./EmailService";
import {ShoppingCartService} from "./ShoppingCartService";
import {AdditionalAddress} from "../Entities/Address";
import {UserProfileDTO} from "../DTO/UserProfileDTO";
import {getManager} from "typeorm";
export class UserService {
    private userRepository = AppDataSource.getRepository(User);
    private cartRepository = new ShoppingCartService();
    private profileRepository = AppDataSource.getRepository(Profile);
    private addressRepository = AppDataSource.getRepository(AdditionalAddress);

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
            phone: data.phone,
            avatar: data.avatar,
            born_date: data.born_date
        });

        await profileRepository.save(profile);

        this.cartRepository.createOrder(savedUser.user_id);
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


    async getUserFromToken(token: string): Promise<User> {
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


    public async verifyPassword(user: User, password: string): Promise<void> {
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
     * Verifica si el código de restablecimiento es válido
     */
    async verifyResetCode(token: string, code: string): Promise<boolean> {
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

            return true;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Token inválido o expirado');
        }
    }

    /**
     * Completa el proceso de restablecimiento de contraseña después de verificar el código
     */
    async completePasswordReset(token: string, newPassword: string): Promise<void> {
        try {
            const jwtService = new JWTService();
            const decoded = jwtService.verifyToken(token);

            // Verificar que el token sea para restablecer contraseña
            if (decoded.purpose !== 'password-reset') {
                throw new Error('Token inválido para restablecer contraseña');
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

    /**
     * Restablece la contraseña usando un token JWT
     */
    async resetPassword(token: string, code: string, newPassword: string): Promise<void> {
        // Primero verificamos el código
        await this.verifyResetCode(token, code);
        // Si la verificación es exitosa, completamos el restablecimiento
        await this.completePasswordReset(token, newPassword);
    }


    async socialAuth(email: string, name: string, photoURL?: string, provider?: string): Promise<User> {
        const userRepository = AppDataSource.getRepository(User);
        const profileRepository = AppDataSource.getRepository(Profile);

        // Buscar usuario por email
        let user = await userRepository.findOne({
            where: { email },
            relations: ['profile']
        });

        if (!user) {
            // Crear nuevo perfil primero
            const profile = new Profile();
            profile.name = name;
            profile.lastName = '';
            profile.avatar = photoURL || '';
            profile.email = email;

            await profileRepository.save(profile);

            // Corregir el tipo de role usando el enum Role
            const newUser = userRepository.create({
                email: email,
                password: await bcrypt.hash(Math.random().toString(36).substring(2, 15), 10),
                role: Role.CLIENTE, // Usar el enum Role en lugar de string
                banned: false,
                banned_at: null,
                ban_reason: null,
                profile: profile
            });

            // Guardar el usuario
            await userRepository.save(newUser);

            // Recargar el usuario con el perfil
            user = await userRepository.findOne({
                where: { email },
                relations: ['profile']
            });

            if (!user) {
                throw new Error("No se pudo crear el usuario");
            }
        }

        return user;
    }
    async getProfileAndAddresses(user_id: number): Promise<UserProfileDTO> {
        const profile = await this.profileRepository.findOne({
            where: { user: { user_id } }
        });
        if (!profile) {
            throw new Error("Perfil no encontrado");
        }

        const addresses = await this.addressRepository.find({
            where: { user_id }
        });

        return new UserProfileDTO(profile.name, profile.lastName, addresses);
    }

    /**
     * Elimina completamente un usuario y todos sus datos relacionados
     * @param userId ID del usuario a eliminar
     */
    async deleteUserCompletely(userId: number): Promise<void> {
        // Usamos el DataSource para crear un QueryRunner y manejar la transacción
        const queryRunner = AppDataSource.createQueryRunner();

        try {
            await queryRunner.connect();
            await queryRunner.startTransaction();

            // 1. Primero obtenemos el usuario con todas sus relaciones
            const user = await queryRunner.manager.findOne(User, {
                where: { user_id: userId },
                relations: [
                    'profile',
                    'reviews',
                    'wishlists',
                    'orders',
                    'orders.orderDetails',
                    'orders.payment',
                    'additional_addresses',
                    'payment_methods'
                ]
            });

            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            // 2. Eliminar órdenes y sus detalles/pagos
            if (user.orders && user.orders.length > 0) {
                for (const order of user.orders) {
                    // Eliminar payment primero si existe
                    if (order.payments) {
                        await queryRunner.manager.remove(order.payments);
                    }

                    // Eliminar order details
                    if (order.details && order.details.length > 0) {
                        await queryRunner.manager.remove(order.details);
                    }

                    // Finalmente eliminar la orden
                    await queryRunner.manager.remove(order);
                }
            }

            // 3. Eliminar wishlists (se eliminan por cascada pero lo hacemos explícitamente)
            if (user.wishlists && user.wishlists.length > 0) {
                await queryRunner.manager.remove(user.wishlists);
            }

            // 4. Eliminar reviews
            if (user.reviews && user.reviews.length > 0) {
                await queryRunner.manager.remove(user.reviews);
            }

            // 5. Eliminar direcciones adicionales
            if (user.additional_addresses && user.additional_addresses.length > 0) {
                await queryRunner.manager.remove(user.additional_addresses);
            }

            // 6. Eliminar métodos de pago
            if (user.payment_methods && user.payment_methods.length > 0) {
                await queryRunner.manager.remove(user.payment_methods);
            }

            // 7. Eliminar perfil (se elimina por cascada pero lo hacemos explícitamente)
            if (user.profile) {
                await queryRunner.manager.remove(user.profile);
            }

            // 8. Finalmente eliminar el usuario
            await queryRunner.manager.remove(user);

            await queryRunner.commitTransaction();
        } catch (error) {
            // Si hay algún error, hacemos rollback
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            // Liberamos el queryRunner
            await queryRunner.release();
        }
    }



}