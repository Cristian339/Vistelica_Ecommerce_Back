import { EntityRepository, Repository } from "typeorm";
import { Category } from "../Entities/Category";

@EntityRepository(Category)
export class CategoryRepository extends Repository<Category> {
    async findAllWithSubcategories() {
        return this.find({ relations: ["subcategories"] });
    }
}
