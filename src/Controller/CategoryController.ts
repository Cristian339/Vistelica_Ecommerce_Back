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
}
