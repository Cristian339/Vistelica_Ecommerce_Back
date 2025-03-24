import { Repository } from "typeorm";
import { ProductReview } from "../entities/ProductReview";
import { User } from "../Entities/User";
import { Products } from "../Entities/Products";
import { AppDataSource } from "../Config/database";

export class ProductReviewService {
    private reviewRepository: Repository<ProductReview>;
    private userRepository: Repository<User>;
    private productRepository: Repository<Products>;

    constructor() {
        this.reviewRepository = AppDataSource.getRepository(ProductReview);
        this.userRepository = AppDataSource.getRepository(User);
        this.productRepository = AppDataSource.getRepository(Products);
    }

    //  Crear una reseña de producto
    async createReview(userId: number, productId: number, rating: number, reviewText: string): Promise<ProductReview> {
        try {
            const user = await this.userRepository.findOneBy({ user_id: userId });
            if (!user) throw new Error("User not found");

            const product = await this.productRepository.findOneBy({ product_id: productId });
            if (!product) throw new Error("Product not found");

            const review = new ProductReview();
            review.user = user;
            review.product = product;
            review.rating = rating;
            review.review_text = reviewText;

            return await this.reviewRepository.save(review);
        } catch (error) {
            console.error("Error creating review:", error);
            throw new Error("Error creating review");
        }
    }

    //  Obtener todas las reseñas de un producto
    async getReviewsByProduct(productId: number): Promise<ProductReview[]> {
        try {
            return await this.reviewRepository.find({
                where: { product: { product_id: productId } },
                relations: ["user", "product"]
            });
        } catch (error) {
            console.error("Error fetching reviews by product:", error);
            throw new Error("Error fetching reviews by product");
        }
    }

    //  Obtener todas las reseñas de un usuario
    async getReviewsByUser(userId: number): Promise<ProductReview[]> {
        try {
            return await this.reviewRepository.find({
                where: { user: { user_id: userId } },
                relations: ["user", "product"]
            });
        } catch (error) {
            console.error("Error fetching reviews by user:", error);
            throw new Error("Error fetching reviews by user");
        }
    }

    //  Eliminar una reseña por ID
    async deleteReview(reviewId: number): Promise<void> {
        try {
            const review = await this.reviewRepository.findOneBy({ review_id: reviewId });
            if (!review) throw new Error("Review not found");

            await this.reviewRepository.remove(review);
        } catch (error) {
            console.error("Error deleting review:", error);
            throw new Error("Error deleting review");
        }
    }
}
