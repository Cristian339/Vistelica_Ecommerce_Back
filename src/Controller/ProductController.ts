import {Request, Response} from 'express';
import {ProductService} from '../Service/ProductService';
import {uploadImage} from "../Config/Cloudinary";
import {CategoryService} from "../Service/CategoryService";
import {Color, Size} from "../Entities/Products";

export class ProductController {
    private productService = new ProductService();
    private CategoryService = new CategoryService();

    constructor() {
        this.create = this.create.bind(this);
        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);

    }

    async create(req: Request, res: Response): Promise<Response> {
        try {
            let productData: any = req.body.data ? JSON.parse(req.body.data) : req.body;

            const requiredFields = ['name', 'description', 'price', 'stock_quantity', 'category_id', 'subcategory_id',  'colors'];
            for (const field of requiredFields) {
                if (!productData[field]) {
                    return res.status(400).json({ error: `Falta el campo obligatorio: ${field}` });
                }
            }

            const { name, description, price, stock_quantity, category_id, subcategory_id, sizes, discount_percentage, colors } = productData;

            const category = await this.CategoryService.getCategoryById(category_id);
            const subcategory = await this.CategoryService.getSubcategoryById(subcategory_id);

            if (!category || !subcategory) {
                return res.status(404).json({ error: 'Categoría o subcategoría no encontrados' });
            }

            const uploadedImages: { image_url: string, is_main: boolean }[] = [];

            if (req.files && Array.isArray(req.files)) {
                for (let i = 0; i < req.files.length; i++) {
                    const file: any = req.files[i];
                    const imageUrl = await uploadImage('productos', file.path);
                    uploadedImages.push({
                        image_url: imageUrl,
                        is_main: i === 0,
                    });
                }
            }

            const product = await this.productService.createProduct({
                name,
                description,
                price,
                stock_quantity,
                category,
                subcategory,
                sizes,
                colors,
                discount_percentage,
            }, uploadedImages);

            const productWithDetails = await this.productService.getProductById(product.product_id);

            return res.status(201).json(productWithDetails);
        } catch (error) {
            console.error('Error al crear el producto:', error);
            return res.status(500).json({ msg: 'Error creando el producto', error: (error as Error).message });
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
            const { productId } = req.params; // Asegúrate de que el nombre coincide con la ruta
            const product = await this.productService.getProductById(Number(productId));

            if (!product) {
                return res.status(404).json({ message: "Producto no encontrado" });
            }

            return res.status(200).json({
                product_id: product.product_id,
                name: product.name,
                description: product.description,
                price: product.price,
                discount_percentage: product.discount_percentage,
                stock_quantity: product.stock_quantity,
                size: product.sizes,
                image_url: product.subcategory.image_url_sub,
                category: product.category,
                subcategory: product.subcategory,
                reviews: product.reviews,
                created_at: product.created_at,
                updated_at: product.updated_at
            });
        } catch (error) {
            console.error("Error al obtener el producto:", error);
            return res.status(500).json({
                message: "Error al obtener el producto",
                error: (error as Error).message
            });
        }
    }


    // En tu backend (controller):
    async changeModeDiscard(req: Request, res: Response): Promise<Response> {
        try {
            const { productId } = req.params;
            const updatedProduct = await this.productService.changeModeDiscard(Number(productId));

            // Obtener el producto con relaciones completas
            // @ts-ignore
            const productWithRelations = await this.productService.getProductById(updatedProduct.product_id);

            return res.status(200).json(productWithRelations);
        } catch (error) {
            console.error('Error changing discard mode:', error);
            return res.status(500).json({
                message: 'Error changing discard mode',
                error: (error as Error).message
            });
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





    // Método para obtener el precio, descuento y precio con descuento
    async getProductPriceWithDiscount(req: Request, res: Response): Promise<Response> {
        try {
            const { productId } = req.params;  // Obtener el ID del producto desde los parámetros de la URL

            // Obtener el producto por ID
            const product = await this.productService.getProductById(Number(productId));

            if (!product) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }

            // Calcular el precio con descuento
            const { price, discount_percentage } = product;
            const discountedPrice = await this.productService.calculateDiscountedPrice(price, discount_percentage);
            const formattedDiscountedPrice = discountedPrice.toFixed(2);
            return res.status(200).json({
                productId: product.product_id,
                name: product.name,
                originalPrice: price,
                discountPercentage: discount_percentage,
                discounted_price: formattedDiscountedPrice,
            });
        } catch (error) {
            return res.status(500).json({ msg: 'Error obteniendo el precio con descuento', error: (error as Error).message });
        }
    }





    /**
     * Obtiene las tallas disponibles para un producto por nombre
     */
    async getSizesByName(req: Request, res: Response): Promise<Response> {
        try {
            const { productName } = req.params;
            const sizes = await this.productService.getSizesByProductName(productName);
            return res.status(200).json({ sizes });
        } catch (error) {
            console.error('Error getting sizes by product name:', error);
            return res.status(500).json({
                message: 'Error getting sizes by product name',
                error: (error as Error).message
            });
        }
    }

    /**
     * Obtiene los colores disponibles para un producto específico
     */
    async getColorsByNameAndSize(req: Request, res: Response): Promise<Response> {
        try {
            const { productName, size } = req.params;
            const colors = await this.productService.getColorsByProductAndSize(
                productName,
                size as Size
            );
            return res.status(200).json({ colors });
        } catch (error) {
            console.error('Error getting colors by product and size:', error);
            return res.status(500).json({
                message: 'Error getting colors by product and size',
                error: (error as Error).message
            });
        }
    }

    /**
     * Obtiene un producto específico por nombre, talla y color
     */
    async getProductByNameSizeColor(req: Request, res: Response): Promise<Response> {
        try {
            const { productName, size, color } = req.params;
            const product = await this.productService.getProductByNameSizeAndColor(
                productName,
                size as Size,
                color as Color
            );

            if (!product) {
                return res.status(404).json({
                    message: 'Product not found with these specifications'
                });
            }

            return res.status(200).json(product);
        } catch (error) {
            console.error('Error getting product by name, size and color:', error);
            return res.status(500).json({
                message: 'Error getting product by name, size and color',
                error: (error as Error).message
            });
        }
    }

    /**
     * Obtiene todas las variantes de un producto por nombre
     */
    async getProductVariants(req: Request, res: Response): Promise<Response> {
        try {
            const { productName } = req.params;
            const variants = await this.productService.getProductVariantsByName(productName);
            return res.status(200).json(variants);
        } catch (error) {
            console.error('Error getting product variants:', error);
            return res.status(500).json({
                message: 'Error getting product variants',
                error: (error as Error).message
            });
        }
    }


    /**
     * Obtiene todas las imágenes principales de los productos
     */
    async getMainProductImages(req: Request, res: Response): Promise<void> {
        try {
            const images = await this.productService.getMainProductImages();

            if (!images || images.length === 0) {
                res.status(404).json({ message: 'No se encontraron imágenes principales' });
                return;
            }

            res.status(200).json(images);
        } catch (error) {
            console.error('Error al obtener imágenes principales:', error);
            res.status(500).json({
                message: 'Error al obtener imágenes principales',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }

    /**
     * Obtiene la imagen principal de un producto específico por ID
     */
    async getMainImageByProductId(req: Request, res: Response): Promise<void> {
        try {
            const productId = parseInt(req.params.productId);

            if (isNaN(productId)) {
                res.status(400).json({ error: 'ID de producto inválido' });
                return;
            }

            const image = await this.productService.getMainImageByProductId(productId);

            if (!image) {
                res.status(404).json({ message: 'No se encontró imagen principal para este producto' });
                return;
            }

            res.status(200).json(image);
        } catch (error) {
            console.error('Error al obtener imagen principal:', error);
            res.status(500).json({
                message: 'Error al obtener imagen principal',
                error: error instanceof Error ? error.message : 'Error desconocido'
            });
        }
    }


}