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
import {PaymentMethod} from "../Entities/PaymentMethod";
import {Wishlist} from "../Entities/Wishlist";
import {Order} from "../Entities/Order";
import {OrderDetail} from "../Entities/OrderDetail";
import {Payment} from "../Entities/Payment";
import {Review} from "../Entities/Review";
export class UserService {
    private userRepository = AppDataSource.getRepository(User);
    private cartRepository = new ShoppingCartService();
    private profileRepository = AppDataSource.getRepository(Profile);
    private addressRepository = AppDataSource.getRepository(AdditionalAddress);


    private pendingEmailChanges = new Map<number, {
        userId: number;
        verificationCode: string;
        expiresAt: Date;
    }>();

    private emailService = new EmailService();

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

        // Crear y guardar el perfil
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

        // Función helper para crear direcciones
        const createAddress = async (addressData: any, defaultLabel: string, defaultIsDefault: boolean) => {
            if (addressData && addressData.street && addressData.city && addressData.state &&
                addressData.postal_code && addressData.country) {

                const addressRepository = AppDataSource.getRepository(AdditionalAddress);
                const address = addressRepository.create({
                    street: addressData.street,
                    city: addressData.city,
                    state: addressData.state,
                    postal_code: addressData.postal_code,
                    country: addressData.country,
                    block: addressData.block || '',
                    floor: addressData.floor || '',
                    door: addressData.door || '',
                    label: addressData.label || defaultLabel,
                    is_default: addressData.is_default !== undefined ? addressData.is_default : defaultIsDefault,
                    user: savedUser,
                    user_id: savedUser.user_id
                });

                await addressRepository.save(address);
            }
        };

        // Guardar dirección principal (si existe)
        await createAddress(data.getMainAddressData(), 'Dirección Principal', true);

        // Guardar dirección adicional (si está marcada para incluir)
        if (data.includeAdditionalAddress) {
            await createAddress(data.getAdditionalAddressData(), 'Dirección Adicional', false);
        }

        // Obtener el usuario completo con todas las relaciones
        const result = await this.userRepository.findOne({
            where: {user_id: savedUser.user_id},
            relations: ['profile', 'additional_addresses']
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
     * Envía un código de verificación al email actual para autorizar el cambio de email
     * @param userId ID del usuario
     * @param password Contraseña actual para verificación
     */
    async sendEmailChangeVerification(
        userId: number,
        password: string
    ): Promise<{ success: boolean; message: string }> {
        try {
            // 1. Verificar usuario y contraseña
            const user = await this.userRepository.findOne({
                where: { user_id: userId },
                select: ['user_id', 'email', 'password'] // Solo seleccionamos los campos necesarios
            });

            if (!user) {
                return { success: false, message: 'Usuario no encontrado' };
            }

            // Verificar contraseña
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return { success: false, message: 'Contraseña incorrecta' };
            }

            // 2. Generar código de 6 dígitos
            const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

            // 3. Guardar la solicitud
            this.pendingEmailChanges.set(user.user_id, {
                userId: user.user_id,
                verificationCode,
                expiresAt
            });

            // 4. Enviar email con el código
            await this.emailService.sendEmailVerificationCode(user.email, verificationCode);

            return {
                success: true,
                message: 'Código de verificación enviado a tu email actual'
            };
        } catch (error) {
            console.error('Error en sendEmailChangeVerification:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error al enviar código de verificación'
            };
        }
    }

    /**
     * Cambia el email después de validar el código de verificación
     * @param userId ID del usuario
     * @param code Código de verificación recibido
     * @param newEmail Nuevo email a establecer
     */
    async confirmEmailChange(
        userId: number,
        code: string,
        newEmail: string
    ): Promise<{ success: boolean; message: string }> {
        const queryRunner = AppDataSource.createQueryRunner();

        try {
            await queryRunner.connect();
            await queryRunner.startTransaction();

            // 1. Verificar que existe una solicitud pendiente
            const request = this.pendingEmailChanges.get(userId);
            if (!request) {
                throw new Error('No hay solicitud de cambio de email pendiente');
            }

            // 2. Verificar que el código no haya expirado
            if (new Date() > request.expiresAt) {
                this.pendingEmailChanges.delete(userId);
                throw new Error('El código de verificación ha expirado');
            }

            // 3. Verificar que el código coincida
            if (request.verificationCode !== code) {
                throw new Error('Código de verificación incorrecto');
            }

            // 4. Validar el nuevo email
            if (!newEmail || !newEmail.includes('@')) {
                throw new Error('El email proporcionado no es válido');
            }

            // Verificar si el nuevo email ya existe
            const emailExists = await queryRunner.manager.findOne(User, {
                where: { email: newEmail }
            });

            if (emailExists) {
                throw new Error('El email ya está en uso por otra cuenta');
            }

            // 5. Obtener el usuario completo
            const user = await queryRunner.manager.findOne(User, {
                where: { user_id: userId },
                relations: ['profile']
            });

            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            // 6. Verificar que el nuevo email sea diferente al actual
            if (user.email === newEmail) {
                throw new Error('El nuevo email debe ser diferente al actual');
            }

            // 7. Actualizar el email en User
            user.email = newEmail;
            await queryRunner.manager.save(User, user);

            // 8. Actualizar también en Profile si existe
            if (user.profile) {
                user.profile.email = newEmail;
                await queryRunner.manager.save(Profile, user.profile);
            }

            // 9. Eliminar la solicitud pendiente
            this.pendingEmailChanges.delete(userId);

            await queryRunner.commitTransaction();

            return {
                success: true,
                message: 'Email actualizado correctamente'
            };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('Error en confirmEmailChange:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Error al confirmar cambio de email'
            };
        } finally {
            await queryRunner.release();
        }
    }






    /**
     * Elimina completamente un usuario y todos sus datos relacionados
     * @param userId ID del usuario a eliminar
     */
    async deleteUserCompletely(userId: number): Promise<void> {
        const queryRunner = AppDataSource.createQueryRunner();

        try {
            await queryRunner.connect();
            await queryRunner.startTransaction();

            // 1. Obtener el usuario con todas sus relaciones
            const user = await queryRunner.manager.findOne(User, {
                where: { user_id: userId },
                relations: [
                    'profile',
                    'reviews',
                    'wishlists',
                    'orders',
                    'orders.details',      // Relación OneToMany con OrderDetail
                    'orders.payments',     // Relación OneToMany con Payment
                    'additional_addresses',
                    'payment_methods'
                ]
            });

            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            // 2. Eliminar órdenes y sus relaciones
            if (user.orders && user.orders.length > 0) {
                for (const order of user.orders) {
                    // Eliminar payments (OneToMany)
                    if (order.payments && order.payments.length > 0) {
                        await queryRunner.manager.remove(Payment, order.payments);
                    }

                    // Eliminar order details (OneToMany)
                    if (order.details && order.details.length > 0) {
                        await queryRunner.manager.remove(OrderDetail, order.details);
                    }

                    // Eliminar la orden
                    await queryRunner.manager.remove(Order, order);
                }
            }

            // 3. Eliminar wishlists (OneToMany)
            if (user.wishlists && user.wishlists.length > 0) {
                await queryRunner.manager.remove(Wishlist, user.wishlists);
            }

            // 4. Eliminar reviews (OneToMany)
            if (user.reviews && user.reviews.length > 0) {
                await queryRunner.manager.remove(Review, user.reviews);
            }

            // 5. Eliminar direcciones adicionales (OneToMany)
            // Nota: Las direcciones usadas en órdenes no se deben eliminar
            const addressesNotInOrders = user.additional_addresses?.filter(address =>
                !user.orders?.some(order => order.address?.id === address.id)
            );

            if (addressesNotInOrders && addressesNotInOrders.length > 0) {
                await queryRunner.manager.remove(AdditionalAddress, addressesNotInOrders);
            }

            // 6. Eliminar métodos de pago (OneToMany)
            if (user.payment_methods && user.payment_methods.length > 0) {
                await queryRunner.manager.remove(PaymentMethod, user.payment_methods);
            }

            // 7. Eliminar perfil (OneToOne)
            if (user.profile) {
                await queryRunner.manager.remove(Profile, user.profile);
            }

            // 8. Finalmente eliminar el usuario
            await queryRunner.manager.remove(User, user);

            await queryRunner.commitTransaction();
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }




}