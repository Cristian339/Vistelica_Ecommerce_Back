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
        this.registerUser = this.registerUser.bind(this);
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

    async registerUser(req: Request, res: Response): Promise<Response> {
        try {
            if (!req.body.email) {
                return res.status(400).json({message: "El email es obligatorio"});
            }

            if (!req.body.password) {
                return res.status(400).json({message: "La contraseña es obligatoria"});
            }

            const userDTO = new UserRegisterDTO(req.body);
            const errors = userDTO.validate();

            if (errors.length > 0) {
                return res.status(400).json({errors});
            }

            const user = await this.userService.createUser(userDTO);
            return res.status(201).json(user);

        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).json({message: error.message});
            }
            return res.status(500).json({message: "Error al registrar usuario", error});
        }
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
                profile: user.profile
            };

            return res.status(200).json(userResponse);
        } catch (error) {
            if (error instanceof Error) {
                return res.status(400).json({ message: error.message });
            }
            return res.status(500).json({ message: 'Error al obtener usuario' });
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
                    // Se elimina username ya que no existe en la entidad User
                    profilePicture: user.profile?.avatar // Cambiado de avatarUrl a avatar
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
}