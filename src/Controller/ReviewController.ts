import { Request, Response } from "express";
import { ReviewService } from "../Service/ReviewService";

export class ProductReviewController {
    private productReviewService = new ReviewService();

    constructor() {
        this.create = this.create.bind(this);
        this.getByProduct = this.getByProduct.bind(this);
        this.getByProductName = this.getByProductName.bind(this); // Nuevo método
        this.getByUser = this.getByUser.bind(this);
        this.delete = this.delete.bind(this);
    }

    // Crear una reseña para un producto
    async create(req: Request, res: Response): Promise<Response> {
        try {
            const { user_id, product_id, rating, review_text } = req.body;
            const review = await this.productReviewService.createReview(user_id, product_id, rating, review_text);
            return res.status(201).json(review);
        } catch (error) {
            return res.status(500).json({ message: "Error creating review", error });
        }
    }

    // Obtener todas las reseñas de un producto por ID
    async getByProduct(req: Request, res: Response): Promise<Response> {
        try {
            const productId = Number(req.params.productId);
            const reviews = await this.productReviewService.getReviewsByProduct(productId);
            return res.status(200).json(reviews);
        } catch (error) {
            return res.status(500).json({ message: "Error fetching reviews for product", error });
        }
    }

    // Obtener reseñar por nombre producto
    async getByProductName(req: Request, res: Response): Promise<Response> {
        try {
            const { productName } = req.params;
            const reviews = await this.productReviewService.getReviewsByProductName(productName);
            return res.status(200).json(reviews);
        } catch (error) {
            return res.status(500).json({
                message: "Error fetching reviews by product name",
                error: error instanceof Error ? error.message : error
            });
        }
    }

    // Obtener todas las reseñas hechas por un usuario
    async getByUser(req: Request, res: Response): Promise<Response> {
        try {
            const userId = Number(req.params.userId);
            const reviews = await this.productReviewService.getReviewsByUser(userId);
            return res.status(200).json(reviews);
        } catch (error) {
            return res.status(500).json({ message: "Error fetching reviews by user", error });
        }
    }

    // Eliminar una reseña
    async delete(req: Request, res: Response): Promise<Response> {
        try {
            const reviewId = Number(req.params.id);
            await this.productReviewService.deleteReview(reviewId);
            return res.status(200).json({ message: "Review deleted successfully" });
        } catch (error) {
            return res.status(500).json({ message: "Error deleting review", error });
        }
    }
}