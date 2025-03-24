import { EntityRepository, Repository } from "typeorm";
import { Review } from "../Entities/Review";

@EntityRepository(Review)
export class ProductReviewRepository extends Repository<Review> {
    async findAllWithUsersAndProducts() {
        return this.find({ relations: ["user", "product"] });
    }

    async findByProduct(productId: number) {
        return this.find({
            where: { product: { product_id: productId } },
            relations: ["user", "product"],
        });
    }

    async findByUser(userId: number) {
        return this.find({
            where: { user: { user_id: userId } },
            relations: ["user", "product"],
        });
    }
}
