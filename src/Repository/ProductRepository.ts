import { Repository } from "typeorm";
import { AppDataSource } from "../Config/database";
import { Products } from "../Entities/Products";

export class ProductRepository {
    private repo: Repository<Products>;

    constructor() {
        this.repo = AppDataSource.getRepository(Products);
    }

    // Crear un nuevo producto
    async createProduct(data: Partial<Products>): Promise<Products> {
        const product = this.repo.create(data);
        return await this.repo.save(product);
    }

    // Obtener todos los productos
    async getAllProducts(): Promise<Products[]> {
        try {
            const products = await this.repo.find();
            return products;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw new Error('Error fetching products');
        }
    }

    // Eliminar un producto
    async deleteProduct(id: number): Promise<void> {
        await this.repo.delete(id);
    }
}
