import { UserRegisterDTO } from "../DTO/UserRegisterDTO";
import { User, Role } from "../Entities/User";
import { AppDataSource } from "../Config/database";
import bcrypt from 'bcryptjs';

export class UserService {
    private userRepository = AppDataSource.getRepository(User);

    async createUser(data: UserRegisterDTO): Promise<User> {
        // Verificar si ya existe un usuario con el mismo nombre
        const existingUser = await this.userRepository.findOne({
            where: { name: data.name }
        });

        if (existingUser) {
            throw new Error('Ya existe un usuario con ese nombre');
        }

        const existingEmail = await this.userRepository.findOne({
            where: { email: data.email }
        });

        if (existingEmail) {
            throw new Error('Este correo electrónico ya está registrado');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password, salt);

        const user = this.userRepository.create({
            name: data.name,
            lastName: data.lastName,
            email: data.email,
            password: hashedPassword,
            role: data.role || Role.CLIENTE
        });

        return await this.userRepository.save(user);
    }
}