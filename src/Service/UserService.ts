import {UserRegisterDTO} from "../DTO/UserRegisterDTO";
import {User, Role} from "../Entities/User";
import {Profile} from "../Entities/Profile";
import {AppDataSource} from "../Config/database";
import bcrypt from 'bcryptjs';
import {JWTService} from "./JWTService";

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
        const jwtService = new JWTService();

        const profile = await jwtService.extractPerfilToken(token, this);

        const user = await this.userRepository.findOne({
            where: {user_id: profile.user.user_id}
        });

        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Contraseña incorrecta');
        }

        await this.userRepository.remove(user);
    }
}