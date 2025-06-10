import {Request, Response} from "express";
import {AppDataSource} from "../Config/database";
import {User} from "../Entities/User";
import {UserRegisterDTO} from "../DTO/UserRegisterDTO";
import {UserService} from "../Service/UserService";
import bcrypt from 'bcryptjs';
import {JWTService} from "../Service/JWTService";
import { Profile } from "../Entities/Profile";
import {UserProfileDTO} from "../DTO/UserProfileDTO";
import {AdditionalAddress} from "../Entities/Address";

export class UserController {
    private userService: UserService = new UserService();
    private jwtService: JWTService = new JWTService();

    constructor() {
        this.initiateRegistration = this.initiateRegistration.bind(this);
        this.verifyRegistration = this.verifyRegistration.bind(this);
        this.resendVerificationCode = this.resendVerificationCode.bind(this);
        this.cancelRegistration = this.cancelRegistration.bind(this);
        this.getRegistrationStatus = this.getRegistrationStatus.bind(this);
        this.login = this.login.bind(this);
    }

    static async getAllUsers(req: Request, res: Response) {
        try {
            const userRepository = AppDataSource.getRepository(User);
            const users = await userRepository.find();
            return res.json(users);
        } catch (error) {
            return res.status(500).json({message: "Error al obtener usuarios", error});
        }
    }

    /**
     * Inicia el proceso de registro enviando código de verificación
     */
    async initiateRegistration(req: Request, res: Response): Promise<Response> {
        try {
            if (!req.body.email) {
                return res.status(400).json({
                    success: false,
                    message: "El email es obligatorio"
                });
            }

            if (!req.body.password) {
                return res.status(400).json({
                    success: false,
                    message: "La contraseña es obligatoria"
                });
            }

            const userDTO = new UserRegisterDTO(req.body);
            const errors = userDTO.validate();

            if (errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    errors
                });
            }

            const result = await this.userService.initiateRegistration(userDTO);

            if (!result.success) {
                return res.status(400).json(result);
            }

            return res.status(200).json({
                success: true,
                message: result.message,
                registrationToken: result.registrationToken
            });

        } catch (error) {
            console.error('Error en initiateRegistration:', error);
            if (error instanceof Error) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            return res.status(500).json({
                success: false,
                message: "Error al iniciar el registro"
            });
        }
    }

    /**
     * Verifica el código y completa el registro del usuario
     */
    async verifyRegistration(req: Request, res: Response): Promise<Response> {
        try {
            const { registrationToken, verificationCode } = req.body;

            if (!registrationToken) {
                return res.status(400).json({
                    success: false,
                    message: "Token de registro es obligatorio"
                });
            }

            if (!verificationCode) {
                return res.status(400).json({
                    success: false,
                    message: "Código de verificación es obligatorio"
                });
            }

            const result = await this.userService.verifyAndCreateUser(
                registrationToken,
                verificationCode
            );

            if (!result.success) {
                return res.status(400).json(result);
            }

            // Generar token JWT para el usuario recién creado
            const token = this.jwtService.generateToken(result.user!);

            return res.status(201).json({
                success: true,
                message: result.message,
                user: result.user,
                token
            });

        } catch (error) {
            console.error('Error en verifyRegistration:', error);
            if (error instanceof Error) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            return res.status(500).json({
                success: false,
                message: "Error al verificar el registro"
            });
        }
    }

    /**
     * Reenvía el código de verificación
     */
    async resendVerificationCode(req: Request, res: Response): Promise<Response> {
        try {
            const { registrationToken } = req.body;

            if (!registrationToken) {
                return res.status(400).json({
                    success: false,
                    message: "Token de registro es obligatorio"
                });
            }

            const result = await this.userService.resendVerificationCode(registrationToken);

            if (!result.success) {
                return res.status(400).json(result);
            }

            return res.status(200).json(result);

        } catch (error) {
            console.error('Error en resendVerificationCode:', error);
            return res.status(500).json({
                success: false,
                message: "Error al reenviar código de verificación"
            });
        }
    }

    /**
     * Cancela un registro pendiente
     */
    async cancelRegistration(req: Request, res: Response): Promise<Response> {
        try {
            const { registrationToken } = req.body;

            if (!registrationToken) {
                return res.status(400).json({
                    success: false,
                    message: "Token de registro es obligatorio"
                });
            }

            const result = await this.userService.cancelRegistration(registrationToken);
            return res.status(200).json(result);

        } catch (error) {
            console.error('Error en cancelRegistration:', error);
            return res.status(500).json({
                success: false,
                message: "Error al cancelar registro"
            });
        }
    }

    /**
     * Obtiene el estado de un registro pendiente
     */
    async getRegistrationStatus(req: Request, res: Response): Promise<Response> {
        try {
            const { registrationToken } = req.params;

            if (!registrationToken) {
                return res.status(400).json({
                    success: false,
                    message: "Token de registro es obligatorio"
                });
            }

            const status = await this.userService.getRegistrationStatus(registrationToken);
            return res.status(200).json({
                success: true,
                status
            });

        } catch (error) {
            console.error('Error en getRegistrationStatus:', error);
            return res.status(500).json({
                success: false,
                message: "Error al obtener estado del registro"
            });
        }
    }

    // MÉTODO DEPRECADO - Mantener solo para compatibilidad
    async registerUser(req: Request, res: Response): Promise<Response> {
        return res.status(400).json({
            success: false,
            message: "Este método está deprecado. Usa /initiate-registration seguido de /verify-registration",
            deprecated: true,
            newEndpoints: {
                step1: "/initiate-registration",
                step2: "/verify-registration",
                optional: {
                    resend: "/resend-verification-code",
                    cancel: "/cancel-registration",
                    status: "/registration-status/:token"
                }
            }
        });
    }

    async getUserByToken(req: Request, res: Response): Promise<Response> {
        try {
            // El token ya fue validado por el middleware auth.authenticate
            const token = req.headers.authorization;
            const user = await this.userService.getUserFromToken(token as string);

            // Omitir información sensible como la contraseña
            const userResponse = {
                user_id: user.user_id,
                email: user.email,
                role: user.role,
                profile: user.profile,
                banned: user.banned,
                ban_reason: user.ban_reason
            };

            return res.status(200).json(userResponse);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({ message: 'Error al obtener usuario' });
        }
    }

    // En UserController.ts
    public async verifyPassword(req: Request, res: Response): Promise<Response> {
        try {
            const token = req.headers.authorization;
            if (!token) {
                return res.status(401).json({ message: 'Token no proporcionado' });
            }

            const { password } = req.body;
            if (!password) {
                return res.status(400).json({ message: 'La contraseña es requerida' });
            }

            const user = await this.userService.getUserFromToken(token);
            await this.userService.verifyPassword(user, password);

            return res.status(200).json({
                success: true,
                message: 'Contraseña verificada correctamente'
            });
        } catch (error) {
            return res.status(200).json({
                success: false,
                message: error
            });
        }
    }

    /**
     * Envía un código de verificación al email actual para autorizar el cambio de email
     */
    async sendEmailChangeVerification(
        req: Request,
        res: Response
    ): Promise<Response> {
        try {
            const token = req.headers.authorization;
            if (!token) {
                return res.status(401).json({success: false, message: 'Token no proporcionado' });
            }

            const { password } = req.body;
            if (!password) {
                return res.status(200).json({success: false, message: 'La contraseña es requerida' });
            }

            // Obtener el usuario desde el token
            const user = await this.userService.getUserFromToken(token);
            await this.userService.verifyPassword(user, password);

            // Enviar código de verificación
            const result = await this.userService.sendEmailChangeVerification(
                user.user_id,
                password
            );

            if (!result.success) {
                return res.status(400).json({success: false, message: result.message });
            }

            return res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(200).json({
                    success: false,
                    message: error.message
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Error al enviar código de verificación'
            });
        }
    }

    /**
     * Confirma el cambio de email con el código de verificación
     */
    async confirmEmailChange(
        req: Request,
        res: Response
    ): Promise<Response> {
        try {
            const token = req.headers.authorization;
            if (!token) {
                return res.status(401).json({ message: 'Token no proporcionado' });
            }

            const { code, newEmail } = req.body;
            if (!code || !newEmail) {
                return res.status(400).json({
                    message: 'Código de verificación y nuevo email son requeridos'
                });
            }

            // Obtener el usuario desde el token
            const user = await this.userService.getUserFromToken(token);

            // Confirmar el cambio de email
            const result = await this.userService.confirmEmailChange(
                user.user_id,
                code,
                newEmail
            );

            if (!result.success) {
                return res.status(400).json({ message: result.message });
            }

            return res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Error al confirmar cambio de email'
            });
        }
    }

    async login(req: Request, res: Response): Promise<Response> {
        try {
            if (!req.body.email) {
                return res.status(400).json({message: "El email es obligatorio"});
            }

            if (!req.body.password) {
                return res.status(400).json({message: "La contraseña es obligatoria"});
            }

            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({
                where: {email: req.body.email}
            });

            if (!user) {
                return res.status(400).json({message: "Usuario no encontrado"});
            }

            const isPasswordValid = await bcrypt.compare(req.body.password, user.password);

            if (!isPasswordValid) {
                return res.status(400).json({message: "Error en el mail o contraseña"});
            }

            const token = this.jwtService.generateToken(user);
            return res.json({token});

        } catch (error) {
            return res.status(500).json({message: "Error al iniciar sesión"});
        }
    }

    async requestPasswordReset(req: Request, res: Response) {
        try {
            const {email} = req.body;

            if (!email) {
                return res.status(400).json({error: 'Email requerido'});
            }

            const userRepository = AppDataSource.getRepository(User);
            const user = await userRepository.findOne({
                where: {email: email}
            });

            if (!user) {
                return res.status(404).json({error: 'No existe una cuenta con este correo electrónico'});
            }

            const userService = new UserService();
            const token = await userService.requestPasswordReset(email);

            res.status(200).json({
                message: 'Código de verificación enviado al correo',
                token
            });
        } catch (error: any) {
            console.error('Error in requestPasswordReset:', error);
            res.status(400).json({error: error.message});
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {
            const {token, code, newPassword} = req.body;

            if (!token || !code || !newPassword) {
                return res.status(400).json({error: 'Token, código y nueva contraseña requeridos'});
            }

            const userService = new UserService();
            await userService.resetPassword(token, code, newPassword);

            res.status(200).json({message: 'Contraseña actualizada correctamente'});
        } catch (error: any) {
            res.status(400).json({error: error.message});
        }
    }

    async verifyResetCode(req: Request, res: Response) {
        try {
            const {token, code} = req.body;

            if (!token || !code) {
                return res.status(400).json({error: 'Token y código son requeridos'});
            }

            const userService = new UserService();
            // Este método solo verificará si el código es correcto
            await userService.verifyResetCode(token, code);

            res.status(200).json({
                valid: true,
                message: 'Código verificado correctamente'
            });
        } catch (error: any) {
            res.status(400).json({
                valid: false,
                error: error.message
            });
        }
    }

    async completePasswordReset(req: Request, res: Response) {
        try {
            const {token, newPassword} = req.body;

            if (!token || !newPassword) {
                return res.status(400).json({error: 'Token y nueva contraseña requeridos'});
            }

            const userService = new UserService();
            await userService.completePasswordReset(token, newPassword);

            res.status(200).json({message: 'Contraseña actualizada correctamente'});
        } catch (error: any) {
            res.status(400).json({error: error.message});
        }
    }

    async checkPhoneAvailability(req: Request, res: Response): Promise<Response> {
        try {
            const { phone } = req.body;

            if (!phone) {
                return res.status(400).json({
                    available: false,
                    message: "El número de teléfono es requerido"
                });
            }

            const profileRepository = AppDataSource.getRepository(Profile);
            const existingProfile = await profileRepository.findOne({
                where: { phone: phone }
            });

            if (existingProfile) {
                return res.status(200).json({
                    available: false,
                    message: "Este número de teléfono ya está registrado"
                });
            }

            return res.status(200).json({
                available: true,
                message: "Número de teléfono disponible"
            });
        } catch (error) {
            console.error('Error verificando disponibilidad de teléfono:', error);
            return res.status(500).json({
                available: false,
                message: "Error al verificar disponibilidad del teléfono"
            });
        }
    }

    async checkEmailAvailability(req: Request, res: Response): Promise<Response> {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    available: false,
                    message: "El email es requerido"
                });
            }

            const userRepository = AppDataSource.getRepository(User);
            const existingUser = await userRepository.findOne({
                where: { email: email }
            });

            if (existingUser) {
                return res.status(200).json({
                    available: false,
                    message: "Este correo ya está registrado"
                });
            }

            return res.status(200).json({
                available: true,
                message: "Email disponible"
            });
        } catch (error) {
            console.error('Error verificando disponibilidad de email:', error);
            return res.status(500).json({
                available: false,
                message: "Error al verificar disponibilidad del email"
            });
        }
    }

    async socialAuth(req: Request, res: Response) {
        try {
            const { authorization } = req.headers;
            const { name, email, photoURL, provider } = req.body;

            if (!authorization || !authorization.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Token no proporcionado' });
            }

            const token = authorization.split('Bearer ')[1];

            // Importa Firebase Admin
            const admin = require('../Config/FirebaseConfig').default;

            // Verifica el token de Firebase
            const decodedToken = await admin.auth().verifyIdToken(token);

            // Verifica que el email coincida con el token
            if (decodedToken.email !== email) {
                return res.status(401).json({ error: 'Datos de usuario no válidos' });
            }

            const user = await this.userService.socialAuth(email, name, photoURL, provider);

            // Generar token JWT usando el servicio existente
            const jwtToken = this.jwtService.generateToken(user);

            return res.status(200).json({
                token: jwtToken,
                user: {
                    id: user.user_id,
                    email: user.email,
                    profilePicture: user.profile?.avatar
                }
            });
        } catch (error: any) {
            console.error('Error en social auth:', error);
            return res.status(401).json({ error: 'Autenticación fallida' });
        }
    }

    public async logout(req: Request, res: Response): Promise<void> {
        try {
            res.status(200).json({
                success: true,
                message: "Sesión cerrada exitosamente"
            });
        } catch (error) {
            console.error("Error en logout:", error);
            res.status(500).json({
                success: false,
                message: "Error al cerrar sesión"
            });
        }
    }

    public async getProfileAnAddress(req: Request, res: Response): Promise<void> {
        try {
            const user_id = req.user?.id;
            if (!user_id) {
                res.status(400).json({ message: "ID de usuario no encontrado en el token" });
                return;
            }

            const data: UserProfileDTO = await this.userService.getProfileAndAddresses(user_id);
            res.status(200).json(data);
        } catch (error: any) {
            res.status(500).json({
                message: "Error al obtener los datos",
                error: error.message || "Error interno del servidor"
            });
        }
    }

    /**
     * Elimina completamente un usuario y todos sus datos relacionados
     */
    async deleteUser(req: Request, res: Response): Promise<Response> {
        try {
            const token = req.headers.authorization;
            if (!token) {
                return res.status(401).json({ message: 'Token no proporcionado' });
            }

            const { password } = req.body;
            if (!password) {
                return res.status(400).json({ message: 'La contraseña es requerida' });
            }

            const user = await this.userService.getUserFromToken(token);
            await this.userService.verifyPassword(user, password);
            await this.userService.deleteUserCompletely(user.user_id);

            return res.status(200).json({
                success: true,
                message: 'Cuenta eliminada permanentemente'
            });
        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Error al eliminar el usuario'
            });
        }
    }
}