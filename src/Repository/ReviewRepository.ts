import { EntityRepository, Repository } from "typeorm";
import { ProductReview } from "../Entities/ProductReview";

@EntityRepository(ProductReview)
export class ProductReviewRepository extends Repository<ProductReview> {
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
