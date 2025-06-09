import { StyleRepository } from '../Repository/StyleRepository';
import { CategoryService } from './CategoryService';
import { ProductService } from './ProductService';
import { Style } from '../Entities/Style';
import { StyleImage } from '../Entities/StyleImage';
import {Products} from "../Entities/Products";
import {StyleImageRepository} from "../Repository/StyleImageRepository";

export class StyleService {
    private styleRepository = new StyleRepository();
    private categoryService = new CategoryService();
    private productService = new ProductService();
    private styleImageRepository = new StyleImageRepository();

    async createStyle(data: {
        name: string;
        description: string;
        category_id: number;
        products: number[];
        styleImages: { image_url: string; is_main: boolean }[];
    }): Promise<Style> {
        try {
            const { name, description, category_id, products } = data;

            // Fetch the category
            const category = await this.categoryService.getCategoryById(category_id);
            if (!category) {
                throw new Error('Category not found');
            }

            // Create the style without images first
            const style = this.styleRepository.create({
                name,
                description,
                category,
                created_at: new Date(),
                updated_at: new Date()
            });

            // Save the style to get an ID
            const savedStyle = await this.styleRepository.save(style);

            // Associate products if provided
            if (products && products.length > 0) {
                const associatedProducts = await Promise.all(
                    products.map((id) => this.productService.getProductById(id))
                );

                if (associatedProducts.includes(null)) {
                    throw new Error('One or more products not found');
                }

                // Associate products with the style
                savedStyle.products = associatedProducts as Products[];
                await this.styleRepository.save(savedStyle);
            }

            // Now add images to the saved style
            for (const img of data.styleImages) {
                const newImage = this.styleImageRepository.create({
                    image_url: img.image_url,
                    is_main: img.is_main,
                    style: savedStyle
                });
                await this.styleImageRepository.save(newImage);
            }

            return await this.styleRepository.findOne({
                where: { style_id: savedStyle.style_id },
                relations: ['category', 'styleImages', 'products']
            }) ?? (() => { throw new Error('Style not found after creation'); })();
        } catch (error) {
            console.error('Error al crear estilo:', error);
            throw new Error("Error creating style");
        }
    }
    // Obtener todos los estilos
    async getAllStyles(): Promise<Style[]> {
        return await this.styleRepository.findAll();
    }

    // Obtener un estilo por ID
    async getStyleById(styleId: number): Promise<Style | null> {
        return await this.styleRepository.findById(styleId);
    }

    // Actualizar un estilo
    async updateStyle(styleId: number, data: Partial<Style>): Promise<Style | null> {
        return await this.styleRepository.update(styleId, data);
    }

    // Eliminar un estilo
    async deleteStyle(styleId: number): Promise<void> {
        await this.styleRepository.delete(styleId);
    }
    async getProductsByStyleId(style_id: number): Promise<any[]> {
        try {
            const style = await this.styleRepository.findOne({
                where: { style_id },
                relations: ['products', 'products.images'],
            });

            if (!style) {
                console.warn(`Style with ID ${style_id} not found.`);
                return [];
            }

            // Mapear productos y extraer solo la imagen principal
            return style.products.map(product => {
                const mainImage = product.images?.find(img => img.is_main);

                return {
                    ...product,
                    main_image: mainImage ? mainImage.image_url : null,
                };
            });


        } catch (error) {
            console.error('Error fetching products by style ID:', error);
            throw new Error('Error fetching products by style ID');
        }
    }
    async getStylesByCategoryId(category_id: number): Promise<any[]> {
        try {
            const styles = await this.styleRepository.findByCategoryId(category_id);

            if (!styles || styles.length === 0) {
                console.warn(`No styles found for category ID ${category_id}.`);
                return [];
            }

            // Map styles and their products, extracting only the main image for each product
            return styles.map(style => ({
                ...style,
                products: style.products.map(product => {
                    const mainImage = product.images?.find(img => img.is_main);
                    return {
                        ...product,
                        main_image: mainImage ? mainImage.image_url : null,
                    };
                }),
            }));
        } catch (error) {
            console.error('Error fetching styles by category ID:', error);
            throw new Error('Error fetching styles by category ID');
        }
    }
}