import { Repository } from "typeorm";
import { AppDataSource } from "../Config/database";
import { Review } from "../Entities/Review";

export class ProductReviewRepository {
    private repo: Repository<Review>;

    constructor() {
        this.repo = AppDataSource.getRepository(Review);
    }

    // Listar todas las reseñas con usuarios y productos
    async findAllWithUsersAndProducts(): Promise<Review[]> {
        return this.repo.find({ relations: ["user", "product"] });
    }

    // Buscar reseñas por ID de producto
    async findByProduct(productId: number): Promise<Review[]> {
        return this.repo.find({
            where: { product: { product_id: productId } },
            relations: ["user", "product"],
        });
    }

    // Buscar reseñas por ID de usuario
    async findByUser(userId: number): Promise<Review[]> {
        return this.repo.find({
            where: { user: { user_id: userId } },
            relations: ["user", "product"],
        });
    }
}
