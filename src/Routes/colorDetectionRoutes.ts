import express, { Request, Response, NextFunction } from 'express';
import { ColorDetectionController } from '../Controller/ColorDetectionController';

const router = express.Router();
const colorDetectionController = new ColorDetectionController();

// Ruta para detectar el "color" (realmente: trozo de imagen)
router.post(
    '/detect-color',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await colorDetectionController.detectColor(req, res);
        } catch (error) {
            next(error);
        }
    }
);

export default router;
