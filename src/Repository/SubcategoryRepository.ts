import { EntityRepository, Repository } from "typeorm";
import { Subcategory } from "../Entities/Subcategory";

@EntityRepository(Subcategory)
export class SubcategoryRepository extends Repository<Subcategory> {
    async findAllWithCategory() {
        return this.find({ relations: ["category"] });
    }
}
