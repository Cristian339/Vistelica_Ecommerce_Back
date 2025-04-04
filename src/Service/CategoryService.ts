import { AppDataSource } from '../Config/database';
import { Category } from '../Entities/Category';

export class CategoryService {
    private categoryRepository = AppDataSource.getRepository(Category);

    async getAllWithSubcategories(): Promise<Category[]> {
        try {
            const categories = await this.categoryRepository.find({
                relations: ['subcategories'],
            });

            return categories;
        } catch (error) {
            throw new Error(`Error fetching categories with subcategories: ${(error as Error).message}`);
        }
    }
}
