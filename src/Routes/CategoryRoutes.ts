import express, { Request, Response, NextFunction } from 'express';
import { CategoryController } from '../Controller/CategoryController';

const router = express.Router();
const categoryController = new CategoryController();

router.get('/categories', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await categoryController.getAllWithSubcategories(req, res);
    } catch (error) {
        next(error);
    }
});

export default router;
