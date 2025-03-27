import { Repository } from "typeorm";
import { AppDataSource } from "../Config/database";
import { Category } from "../Entities/Category";

export class CategoryRepository {
    private repo: Repository<Category>;

    constructor() {
        this.repo = AppDataSource.getRepository(Category);
    }

    // Listar todas las categorías con sus subcategorías
    async findAllWithSubcategories(): Promise<Category[]> {
        return this.repo.find({ relations: ["subcategories"] });
    }
}
