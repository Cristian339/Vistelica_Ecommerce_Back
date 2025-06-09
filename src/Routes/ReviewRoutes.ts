import express, { Router, Request, Response, NextFunction } from "express";
import { ProductReviewController } from "../Controller/ReviewController";

const router = express.Router();
const productReviewController = new ProductReviewController();

// Crear una nueva reseña
router.post("/review", async (req: Request, res: Response, next: NextFunction) => {

    try {
        await productReviewController.create(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener todas las reseñas de un producto por ID
router.get("/reviews/product/:productId", async (req: Request, res: Response, next: NextFunction) => {

    try {
        await productReviewController.getByProduct(req, res);
    } catch (error) {
        next(error);
    }
});

// Nueva ruta: Obtener reseñas por nombre de producto
router.get("/reviews/product/name/:productName", async (req: Request, res: Response, next: NextFunction) => {

    try {
        await productReviewController.getByProductName(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener todas las reseñas de un usuario
router.get("/reviews/user/:userId", async (req: Request, res: Response, next: NextFunction) => {

    try {
        await productReviewController.getByUser(req, res);
    } catch (error) {
        next(error);
    }
});

// Eliminar una reseña
router.delete("/reviews/:id", async (req: Request, res: Response, next: NextFunction) => {

    try {
        await productReviewController.delete(req, res);
    } catch (error) {
        next(error);
    }
});

export default router;