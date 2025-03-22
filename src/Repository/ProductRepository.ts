import { EntityRepository, Repository } from 'typeorm';
import { Product } from '../Entities/Product';

export class ProductRepository extends Repository<Product> {
    async createProduct(data: Partial<Product>): Promise<Product> {
        const product = this.create(data);
        return await this.save(product);
    }

    async getAllProducts(): Promise<Product[]> {
        try {
            const products = await this.find();
            return products as Product[];
        } catch (error) {
            console.error('Error fetching products:', error);
            throw new Error('Error fetching products');
        }
    }

    async deleteProduct(id: number): Promise<void> {
        await this.delete(id);
    }

}