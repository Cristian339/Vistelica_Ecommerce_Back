import express, { Router, Request, Response, NextFunction } from "express";
import { ProductReviewController } from "../Controller/ReviewController";

const router = express.Router();
const productReviewController = new ProductReviewController();

// Crear una nueva reseña
router.post("/review", async (req: Request, res: Response, next: NextFunction) => {
    console.log("POST /reviews");
    try {
        await productReviewController.create(req, res);
    } catch (error) {
        next(error);
    }
});

//  Obtener todas las reseñas de un producto
router.get("/reviews/product/:productId", async (req: Request, res: Response, next: NextFunction) => {
    console.log("GET /reviews/product/:productId");
    try {
        await productReviewController.getByProduct(req, res);
    } catch (error) {
        next(error);
    }
});

//  Obtener todas las reseñas de un usuario
router.get("/reviews/user/:userId", async (req: Request, res: Response, next: NextFunction) => {
    console.log("GET /reviews/user/:userId");
    try {
        await productReviewController.getByUser(req, res);
    } catch (error) {
        next(error);
    }
});

// Eliminar una reseña
router.delete("/reviews/:id", async (req: Request, res: Response, next: NextFunction) => {
    console.log("DELETE /reviews/:id");
    try {
        await productReviewController.delete(req, res);
    } catch (error) {
        next(error);
    }
});

export default router;
