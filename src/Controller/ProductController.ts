import { Request, Response } from 'express';
import { ProductService } from '../Service/ProductService';

export class ProductController {
    private productService = new ProductService();

    constructor() {
        this.create = this.create.bind(this);
        this.getAll = this.getAll.bind(this);
        this.delete = this.delete.bind(this);
    }

    async create(req: Request, res: Response): Promise<Response> {
        try {
            const product = await this.productService.createProduct(req.body);
            return res.status(201).json(product);
        } catch (error) {
            return res.status(500).json({ message: 'Error creating product', error });
        }
    }

    async getAll(req: Request, res: Response): Promise<Response> {
        console.log('controllador');
        try {
            const products = await this.productService.getAllProducts();
            return res.status(200).json(products);
        } catch (error) {
            return res.status(500).json({ message: 'Error fetching products', error });
        }
    }

    async delete(req: Request, res: Response): Promise<Response> {
        try {
            await this.productService.deleteProduct(Number(req.params.id));
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ message: 'Error deleting product', error });
        }
    }
}