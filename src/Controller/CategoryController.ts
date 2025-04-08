import { Request, Response } from 'express';
import { CategoryService } from '../Service/CategoryService';

export class CategoryController {
    private categoryService = new CategoryService();

    async getAllWithSubcategories(req: Request, res: Response): Promise<Response> {
        try {
            const categories = await this.categoryService.getAllWithSubcategories();
            return res.status(200).json(categories);
        } catch (error) {
            return res.status(500).json({
                msg: 'Error al obtener categorías con subcategorías',
                error: (error as Error).message
            });
        }
    }

    async createCategory(req: Request, res: Response): Promise<Response> {
        try {
            const { name } = req.body;
            const category = await this.categoryService.createCategory(name);
            return res.status(201).json(category);
        } catch (error) {
            return res.status(400).json({
                msg: 'Error al crear categoría',
                error: (error as Error).message
            });
        }
    }

    async updateCategory(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const { name } = req.body;
            const category = await this.categoryService.updateCategory(parseInt(id), name);
            return res.status(200).json(category);
        } catch (error) {
            return res.status(400).json({
                msg: 'Error al actualizar categoría',
                error: (error as Error).message
            });
        }
    }

    async toggleDiscardCategory(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const category = await this.categoryService.toggleDiscardCategory(parseInt(id));
            return res.status(200).json(category);
        } catch (error) {
            return res.status(400).json({
                msg: 'Error al cambiar estado de descarte de categoría',
                error: (error as Error).message
            });
        }
    }

    async createSubcategory(req: Request, res: Response): Promise<Response> {
        try {
            const { name, categoryId } = req.body;
            const subcategory = await this.categoryService.createSubcategory(name, categoryId);
            return res.status(201).json(subcategory);
        } catch (error) {
            return res.status(400).json({
                msg: 'Error al crear subcategoría',
                error: (error as Error).message
            });
        }
    }

    async updateSubcategory(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const { name, categoryId } = req.body;
            const subcategory = await this.categoryService.updateSubcategory(parseInt(id), name, categoryId);
            return res.status(200).json(subcategory);
        } catch (error) {
            return res.status(400).json({
                msg: 'Error al actualizar subcategoría',
                error: (error as Error).message
            });
        }
    }

    async toggleDiscardSubcategory(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const subcategory = await this.categoryService.toggleDiscardSubcategory(parseInt(id));
            return res.status(200).json(subcategory);
        } catch (error) {
            return res.status(400).json({
                msg: 'Error al cambiar estado de descarte de subcategoría',
                error: (error as Error).message
            });
        }
    }

    async getCategoryById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const category = await this.categoryService.getCategoryById(parseInt(id));
            return res.status(200).json(category);
        } catch (error) {
            return res.status(404).json({
                msg: 'Error al obtener categoría',
                error: (error as Error).message
            });
        }
    }

    async getSubcategoryById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const subcategory = await this.categoryService.getSubcategoryById(parseInt(id));
            return res.status(200).json(subcategory);
        } catch (error) {
            return res.status(404).json({
                msg: 'Error al obtener subcategoría',
                error: (error as Error).message
            });
        }
    }

    async getSubcategoriesByCategory(req: Request, res: Response): Promise<Response> {
        try {
            const { categoryId } = req.params;
            const subcategories = await this.categoryService.getSubcategoriesByCategory(parseInt(categoryId));
            return res.status(200).json(subcategories);
        } catch (error) {
            return res.status(400).json({
                msg: 'Error al obtener subcategorías',
                error: (error as Error).message
            });
        }
    }
}