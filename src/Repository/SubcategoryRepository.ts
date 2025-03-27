import { Repository } from "typeorm";
import { AppDataSource } from "../Config/database";
import { Subcategory } from "../Entities/Subcategory";

export class SubcategoryRepository {
    private repo: Repository<Subcategory>;

    constructor() {
        this.repo = AppDataSource.getRepository(Subcategory);
    }

    // Listar todas las subcategorías con su categoría asociada
    async findAllWithCategory(): Promise<Subcategory[]> {
        return this.repo.find({ relations: ["category"] });
    }
}
