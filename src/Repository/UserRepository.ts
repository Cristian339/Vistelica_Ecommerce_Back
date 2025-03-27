import { EntityRepository, Repository } from "typeorm";
import { User } from "../Entities/User";

@EntityRepository(User)
export class UserRepository extends Repository<User> {

    //  Buscar un usuario por su email
    async findByEmail(email: string): Promise<User | null> {
        return this.findOneBy({ email });
    }

    //  Buscar un usuario por su ID con su perfil
    async findByIdWithProfile(userId: number): Promise<User | null> {
        return this.findOne({
            where: { user_id: userId },
            relations: ["profile"],
        });
    }

    //  Listar todos los usuarios con sus perfiles
    async findAllWithProfiles(): Promise<User[]> {
        return this.find({ relations: ["profile"] });
    }

    //  Banear a un usuario

}
