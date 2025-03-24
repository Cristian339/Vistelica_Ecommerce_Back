import { Repository } from 'typeorm';
import { Products } from '../Entities/Products';

export class ProductRepository extends Repository<Products> {
    async createProduct(data: Partial<Products>): Promise<Products> {
        const product = this.create(data);
        return await this.save(product);
    }

    async getAllProducts(): Promise<Products[]> {
        try {
            const products = await this.find();
            return products as Products[];
        } catch (error) {
            console.error('Error fetching products:', error);
            throw new Error('Error fetching products');
        }
    }

    async deleteProduct(id: number): Promise<void> {
        await this.delete(id);
    }

}