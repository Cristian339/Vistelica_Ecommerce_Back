import { Repository } from "typeorm";
import { AppDataSource } from "../Config/database";
import { User } from "../Entities/User";

export class UserRepository {
    private repo: Repository<User>;

    constructor() {
        this.repo = AppDataSource.getRepository(User);
    }

    // Buscar un usuario por su email
    async findByEmail(email: string): Promise<User | null> {
        return this.repo.findOne({ where: { email } });
    }

    // Buscar un usuario por su ID con su perfil
    async findByIdWithProfile(userId: number): Promise<User | null> {
        return this.repo.findOne({
            where: { user_id: userId },
            relations: ["profile"],
        });
    }

    // Listar todos los usuarios con sus perfiles
    async findAllWithProfiles(): Promise<User[]> {
        return this.repo.find({ relations: ["profile"] });
    }


}
