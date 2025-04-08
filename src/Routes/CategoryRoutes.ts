import express, { Request, Response, NextFunction } from 'express';
import { CategoryController } from '../Controller/CategoryController';

const router = express.Router();
const categoryController = new CategoryController();

// Rutas para Categorías
router.get('/categories', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await categoryController.getAllWithSubcategories(req, res);
    } catch (error) {
        next(error);
    }
});

router.post('/categories', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await categoryController.createCategory(req, res);
    } catch (error) {
        next(error);
    }
});

router.put('/categories/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await categoryController.updateCategory(req, res);
    } catch (error) {
        next(error);
    }
});

router.patch('/categories/:id/toggle-discard', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await categoryController.toggleDiscardCategory(req, res);
    } catch (error) {
        next(error);
    }
});

router.get('/categories/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await categoryController.getCategoryById(req, res);
    } catch (error) {
        next(error);
    }
});

// Rutas para Subcategorías
router.post('/subcategories', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await categoryController.createSubcategory(req, res);
    } catch (error) {
        next(error);
    }
});

router.put('/subcategories/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await categoryController.updateSubcategory(req, res);
    } catch (error) {
        next(error);
    }
});

router.patch('/subcategories/:id/toggle-discard', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await categoryController.toggleDiscardSubcategory(req, res);
    } catch (error) {
        next(error);
    }
});

router.get('/subcategories/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await categoryController.getSubcategoryById(req, res);
    } catch (error) {
        next(error);
    }
});

router.get('/categories/:categoryId/subcategories', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await categoryController.getSubcategoriesByCategory(req, res);
    } catch (error) {
        next(error);
    }
});

export default router;