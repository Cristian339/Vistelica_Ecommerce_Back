import {Request, Response} from "express";
import {AppDataSource} from "../Config/database";
import {User} from "../Entities/User";
import {UserRegisterDTO} from "../DTO/UserRegisterDTO";
import {UserService} from "../Service/UserService";
import bcrypt from 'bcryptjs';
import {JWTService} from "../Service/JWTService";

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


}