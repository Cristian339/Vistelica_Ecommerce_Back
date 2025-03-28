import {Request, Response} from 'express';
import {ProductService} from '../Service/ProductService';
import {uploadImage} from "../Config/Cloudinary";

export class ProductController {
    private productService = new ProductService();

    constructor() {
        this.create = this.create.bind(this);
        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);

    }

    async create(req: Request, res: Response): Promise<Response> {
        try {
            const { name, description, price, stock_quantity, category_id, subcategory_id, size } = req.body;

            let imageUrl: string | undefined = undefined;

            // Verificar si hay un archivo de imagen en la petición
            if (req.file) {
                imageUrl = await uploadImage('productos', req.file.path);
            }

            const productData = {
                name,
                description,
                price,
                stock_quantity,
                category_id,   // Usar los IDs de categoría y subcategoría
                subcategory_id,
                size,
                image_url: imageUrl
            };

            const product = await this.productService.createProduct(productData);
            const productWithDetails = await this.productService.getProductById(product.product_id);
            return res.status(201).json(productWithDetails);
        } catch (error) {
            return res.status(500).json({ msg: 'Error creating product', error: (error as Error).message });
        }
    }


    async getAll(req: Request, res: Response): Promise<Response> {
        console.log('controllador');
        try {
            const products = await this.productService.getAllProducts();
            return res.status(200).json(products);
        } catch (error) {
            return res.status(500).json({message: 'Error fetching products', error});
        }
    }

    async getById(req: Request, res: Response): Promise<Response> {
        try {
            const product = await this.productService.getProductById(Number(req.params.id));
            return res.status(200).json(product);
        } catch (error) {
            return res.status(500).json({message: 'Error fetching product', error});
        }
    }

    async update(req: Request, res: Response): Promise<Response> {
        try {
            const product = await this.productService.updateProduct(Number(req.params.id), req.body);
            return res.status(200).json(product);
        } catch (error) {
            return res.status(500).json({message: 'Error updating product', error});
        }
    }

    async getByCategoryAndSubcategory(req: Request, res: Response): Promise<Response> {
        try {
            const categoryId = Number(req.params.categoryId);
            const subcategoryId = Number(req.params.subcategoryId);
            const products = await this.productService.getProductsByCategoryAndSubcategory(categoryId, subcategoryId);
            return res.status(200).json(products);
        } catch (error) {
            return res.status(500).json({message: 'Error fetching products by category and subcategory', error});
        }
    }

    async delete(req: Request, res: Response): Promise<Response> {
        try {
            const product = await this.productService.deleteProduct(Number(req.params.id));
            return res.status(200).json(product);
        } catch (error) {
            return res.status(500).json({message: 'Error deleting product', error});
        }
    }
}