import { AppDataSource } from '../Config/database';
import { ProductImageDto } from '../DTO/ProductImageDto';
import { Color, Products, Size } from '../Entities/Products';
import { Category } from "../Entities/Category";
import { Subcategory } from "../Entities/Subcategory";
import { uploadImage } from '../Config/Cloudinary';
import { ProductImage } from "../Entities/ProductImage";
import {Brackets} from "typeorm";

export class ProductService {
    private productRepository = AppDataSource.getRepository(Products);
    private categoryRepository = AppDataSource.getRepository(Category);
    private subcategoryRepository = AppDataSource.getRepository(Subcategory);
    private imageRepository = AppDataSource.getRepository(ProductImage);


    // Crear un nuevo producto
    async createProduct(data: Partial<Products>, images: { image_url: string, is_main: boolean }[]): Promise<Products> {
        try {

            const category = await this.categoryRepository.findOne({
                where: { category_id: data.category?.category_id },
            });

            const subcategory = await this.subcategoryRepository.findOne({
                where: { subcategory_id: data.subcategory?.subcategory_id },
            });

            if (!category || !subcategory) {
                throw new Error("Categoría o subcategoría no encontradas");
            }

            const product = this.productRepository.create({
                ...data,
                category,
                subcategory,
                discount_percentage: data.discount_percentage ?? null,
            });

            const savedProduct = await this.productRepository.save(product);

            for (const img of images) {

                const newImage = this.imageRepository.create({
                    image_url: img.image_url,
                    is_main: img.is_main,
                    product: savedProduct,
                });

                await this.imageRepository.save(newImage);
            }

            return savedProduct;
        } catch (error) {
            console.error('Error al crear producto:', error);
            throw new Error("Error creating product");
        }
    }

    // Obtener todos los productos
    async getAllProducts(): Promise<any[]> {
        try {


            const products = await this.productRepository
                .createQueryBuilder('product')
                .leftJoinAndSelect('product.category', 'category')
                .leftJoinAndSelect('product.subcategory', 'subcategory')
                .leftJoinAndSelect('product.reviews', 'reviews')
                .leftJoinAndSelect('product.images', 'images')
                .leftJoinAndSelect('product.style', 'style')
                .where('product.discard = :discard', { discard: false })
                .getMany();

            const productsWithReviewCount = products.map(product => ({
                product_id: product.product_id,
                name: product.name,
                description: product.description,
                price: product.price,
                stock_quantity: product.stock_quantity,
                sizes: product.sizes,
                colors: product.colors,
                discount_percentage: product.discount_percentage,
                created_at: product.created_at,
                updated_at: product.updated_at,
                categoryId: product.category?.category_id,
                subcategoryId: product.subcategory?.subcategory_id,
                category: product.category,
                subcategory: product.subcategory,
                style: product.style,
                images: product.images,
                reviews_count: product.reviews ? product.reviews.length : 0,
                // Opcional: también puedes incluir el rating promedio
                average_rating: product.reviews && product.reviews.length > 0
                    ? parseFloat((product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length).toFixed(1))
                    : 0.0
            }));


            return productsWithReviewCount;
        } catch (error) {
            console.error('Error al obtener productos:', error);
            throw new Error('Error al obtener productos');
        }
    }

    // Obtener un producto por su ID
    async getProductById(id: number): Promise<Products | null> {
        try {
            // Buscar el producto junto con las relaciones de categoría y subcategoría
            const product = await this.productRepository.findOne({
                where: { product_id: id },
                relations: [
                    'images',
                    'category',
                    'subcategory',
                    'reviews',
                    'style'
                ]
            });

            if (!product) {
                throw new Error('Product not found');
            }

            return product;
        } catch (error) {
            console.error('Error fetching product by id:', error);
            throw new Error('Error fetching product by id');
        }
    }

    // Actualizar un producto por su ID
    async updateProduct(id: number, data: Partial<Products>): Promise<Products> {
        try {


            const product = await this.productRepository.findOne({
                where: { product_id: id },
                relations: ['category', 'subcategory'],
            });

            if (!product) {
                throw new Error('Producto no encontrado');
            }


            //@ts-ignore
            const category = await this.categoryRepository.findOne({ where: { category_id: data.category_id } });
            if (category) {
                product.category = category;
            } else {
                throw new Error('Categoria no encontrada');
            }



            //@ts-ignore
            const subcategory = await this.subcategoryRepository.findOne({ where: { subcategory_id: data.subcategory_id } });
            if (subcategory) {
                product.subcategory = subcategory;
            } else {
                throw new Error('Subcategory not found');
            }


            // Asignar los demás campos
            Object.assign(product, data);

            // Guardar el producto actualizado
            return await this.productRepository.save(product);
        } catch (error) {
            console.error('Error updating product:', error);
            throw new Error('Error updating product');
        }
    }


    // Obtener productos por categoría y subcategoría
    async getProductsByCategoryAndSubcategory(categoryId: number, subcategoryId: number): Promise<any[]> {
        try {
            const products = await this.productRepository
                .createQueryBuilder('product')
                .leftJoinAndSelect('product.category', 'category')
                .leftJoinAndSelect('product.subcategory', 'subcategory')
                .leftJoinAndSelect('product.reviews', 'reviews')
                .leftJoinAndSelect('product.images', 'images')
                .leftJoinAndSelect('product.style', 'style')
                .where('product.category.category_id = :categoryId', { categoryId })
                .andWhere('product.subcategory.subcategory_id = :subcategoryId', { subcategoryId })
                .andWhere('product.discard = :discard', { discard: false })
                .getMany();

            const productsWithRating = products.map(product => ({
                product_id: product.product_id,
                name: product.name,
                description: product.description,
                price: product.price,
                stock_quantity: product.stock_quantity,
                sizes: product.sizes,
                colors: product.colors,
                discount_percentage: product.discount_percentage,
                created_at: product.created_at,
                updated_at: product.updated_at,
                category: product.category,
                subcategory: product.subcategory,
                style: product.style,
                images: product.images,
                reviews_count: product.reviews ? product.reviews.length : 0,
                average_rating: product.reviews && product.reviews.length > 0
                    ? parseFloat((product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length).toFixed(1))
                    : 0.0
            }));

            return productsWithRating;
        } catch (error) {
            console.error('Error fetching products by category and subcategory:', error);
            throw new Error('Error fetching products by category and subcategory');
        }
    }

    // Eliminar un producto por su ID
    async deleteProduct(id: number): Promise<Products> {
        try {
            // Primero, buscar el producto con sus relaciones (categoría y subcategoría)
            const product = await this.productRepository.findOne({
                where: {product_id: id},
                relations: ['category', 'subcategory'],
            });

            if (!product) {
                throw new Error('Product not found');
            }

            // Guardamos la información del producto para devolverla después de la eliminación
            const productToDelete = {...product};

            // Ahora eliminamos el producto
            await this.productRepository.delete(id);

            // Devolvemos el producto eliminado junto con sus relaciones
            return productToDelete;
        } catch (error) {
            console.error('Error deleting product:', error);
            throw new Error('Error deleting product');
        }
    }
    // Método para calcular el precio con descuento
    async calculateDiscountedPrice(price: number, discountPercentage: number | null): Promise<number> {
        if (discountPercentage !== null) {
            const discount = discountPercentage / 100;
            return price * (1 - discount);
        }
        return price;
    }


    async changeModeDiscard(idProduct: number): Promise<Products | null> {
        const product = await this.productRepository.findOne({
            where: { product_id: idProduct },
            relations: ['category', 'subcategory'] // Asegúrate de cargar las relaciones
        });

        if (!product) {
            throw new Error('Product not found');
        }

        product.discard = !product.discard;

        const updatedProduct = await this.productRepository.save(product);

        // Vuelve a cargar el producto con relaciones para asegurarte
        return await this.productRepository.findOne({
            where: { product_id: updatedProduct.product_id },
            relations: ['category', 'subcategory']
        });
    }


    async getSizesByProductName(productName: string): Promise<Size[]> {
        try {
            const products = await this.productRepository.find({
                where: {
                    name: productName,
                    discard: false
                },
                select: ['sizes']
            });

            // Filtramos tallas únicas, eliminando nulos y duplicados
            const uniqueSizes = Array.from(
                new Set(
                    products
                        .map(p => p.sizes)
                        .filter(size => size !== null)
                )
            ) as unknown as Size[];

            return uniqueSizes;
        } catch (error) {
            console.error('Error fetching sizes by product name:', error);
            throw new Error('Error fetching sizes by product name');
        }
    }

    /**
     * Obtiene los colores disponibles para una combinación nombre-talla
     * (Ahora consolida los colores de todos los productos que coincidan)
     */
    async getColorsByProductAndSize(productName: string, size: Size): Promise<Color[]> {
        try {
            const products = await this.productRepository.find({
                where: {
                    name: productName,
                    sizes: size,
                    discard: false
                },
                select: ['colors']
            });

            // Combinamos todos los arrays de colores y filtramos únicos
            const allColors = products.flatMap(p => p.colors || []);
            const uniqueColors = Array.from(new Set(allColors)) as Color[];

            return uniqueColors;
        } catch (error) {
            console.error('Error fetching colors by product and size:', error);
            throw new Error('Error fetching colors by product and size');
        }
    }

    /**
     * Obtiene un producto específico por nombre, talla y color
     * (Ahora busca productos que contengan el color especificado en su array)
     */
    async getProductByNameSizeAndColor(
        productName: string,
        size: Size,
        color: Color
    ): Promise<Products | null> {
        try {
            // Buscamos productos que coincidan con nombre y talla
            const products = await this.productRepository.find({
                where: {
                    name: productName,
                    sizes: size,
                    discard: false
                },
                relations: ['category', 'subcategory', 'images']
            });

            // Filtramos por color (buscando en el array de colores)
            const matchingProducts = products.filter(p =>
                p.colors && p.colors.includes(color)
            );

            return matchingProducts[0] || null;
        } catch (error) {
            console.error('Error fetching product by name, size and color:', error);
            throw new Error('Error fetching product by name, size and color');
        }
    }

    /**
     * Obtiene todas las variantes de un producto por nombre
     * (Incluyendo todas las combinaciones talla-color)
     */
    async getProductVariantsByName(productName: string): Promise<Products[]> {
        try {
            return await this.productRepository.find({
                where: {
                    name: productName,
                    discard: false
                },
                relations: ['category', 'subcategory', 'images'],
                order: {
                    sizes: 'ASC',
                    price: 'ASC'
                }
            });
        } catch (error) {
            console.error('Error fetching product variants by name:', error);
            throw new Error('Error fetching product variants by name');
        }
    }

    async getMainProductImages(): Promise<ProductImageDto[]> {
        try {
            const mainImages = await this.imageRepository.find({
                where: { is_main: true },
                relations: ['product']
            });

            return mainImages.map(image => new ProductImageDto(image));
        } catch (error) {
            console.error('Error al obtener imágenes principales:', error);
            throw new Error('Error al obtener imágenes principales');
        }
    }

    async getMainImageByProductId(productId: number): Promise<ProductImageDto | null> {
        try {
            const mainImage = await this.imageRepository.findOne({
                where: {
                    product: { product_id: productId },
                    is_main: true
                },
                relations: ['product']
            });

            if (!mainImage) return null;
            return new ProductImageDto(mainImage);
        } catch (error) {
            console.error(`Error al obtener imagen principal:`, error);
            throw new Error('Error al obtener imagen principal');
        }
    }

    /**
     * Obtiene todas las imágenes de un producto por su ID
     * @param productId ID del producto
     * @returns Array de ProductImageDto con todas las imágenes del producto
     */
    async getAllImagesByProductId(productId: number): Promise<ProductImageDto[]> {
        try {
            const images = await this.imageRepository.find({
                where: {
                    product: { product_id: productId }
                },
                relations: ['product'],
                order: {
                    is_main: 'DESC' // Opcional: ordenar para que la imagen principal aparezca primero
                }
            });

            return images.map(image => new ProductImageDto(image));
        } catch (error) {
            console.error(`Error al obtener todas las imágenes del producto ${productId}:`, error);
            throw new Error('Error al obtener imágenes del producto');
        }
    }



    async searchProductsByNameAndCategories(
        searchText: string | undefined,
        categoryIds?: number[] | undefined
    ): Promise<{ id: number; name: string; mainImage: string | null; relevance?: number }[]> {
        try {
            if (!searchText || searchText.trim().length < 2) return [];

            // Normalizar el texto de búsqueda
            const searchLower = searchText.toLowerCase().trim();

            // Expandir términos comunes para mejorar la búsqueda
            const termExpansions: { [key: string]: string[] } = {
                'pant': ['pantalón', 'pantalones'],
                'camiset': ['camiseta', 'camisetas'],
                'sudadera': ['sudadera', 'sudaderas'],
                'zapat': ['zapato', 'zapatos', 'zapatilla', 'zapatillas'],
                'jersey': ['jersey', 'jerseys', 'suéter'],
                'falda': ['falda', 'faldas'],
                'camis': ['camisa', 'camisas'],
                'chaqueta': ['chaqueta', 'chaquetas', 'cazadora', 'chándal', 'chandal', 'americana', 'americanas'],
                'chandal': ['chaqueta', 'chaquetas', 'cazadora', 'chándal', 'chandal', 'americana', 'americanas'],
                'chándal': ['chaqueta', 'chaquetas', 'cazadora', 'chándal', 'chandal', 'americana', 'americanas'],
                'americana': ['chaqueta', 'chaquetas', 'cazadora', 'chándal', 'chandal', 'americana', 'americanas']
            };

            // Lista completa de términos contradictorios - AMPLIADA
            const contradictoryTerms: { [key: string]: string[] } = {
                'pant': ['camiseta', 'camisetas', 'vestido', 'vestidos', 'falda', 'faldas', 'top', 'tops', 'camisa', 'camisas', 'jersey', 'jerseys', 'zapato', 'zapatos', 'zapatilla', 'zapatillas', 'chaqueta', 'chaquetas', 'sudadera', 'sudaderas', 'anillo', 'anillos', 'collar', 'collares', 'pulsera', 'pulseras', 'pendiente', 'pendientes', 'reloj', 'relojes', 'gorra', 'gorras', 'sombrero', 'sombreros', 'cinturón', 'cinturones', 'bolso', 'bolsos', 'mochila', 'mochilas', 'calcetín', 'calcetines', 'llavero', 'llaveros', 'pack', 'set'],
                'camiset': ['pantalón', 'pantalones', 'vestido', 'vestidos', 'falda', 'faldas', 'short', 'shorts', 'bermuda', 'bermudas', 'jersey', 'jerseys', 'zapato', 'zapatos', 'zapatilla', 'zapatillas', 'top', 'tops', 'body', 'bodies', 'sudadera', 'sudaderas', 'anillo', 'anillos', 'collar', 'collares', 'pulsera', 'pulseras', 'pendiente', 'pendientes', 'reloj', 'relojes', 'gorra', 'gorras', 'sombrero', 'sombreros', 'cinturón', 'cinturones', 'bolso', 'bolsos', 'mochila', 'mochilas', 'calcetín', 'calcetines', 'llavero', 'llaveros', 'pack', 'set'],
                'sudadera': ['camiseta', 'camisetas', 'pantalón', 'pantalones', 'vestido', 'vestidos', 'falda', 'faldas', 'zapato', 'zapatos', 'zapatilla', 'zapatillas', 'top', 'tops', 'body', 'bodies', 'camisa', 'camisas', 'anillo', 'anillos', 'collar', 'collares', 'pulsera', 'pulseras', 'pendiente', 'pendientes', 'reloj', 'relojes', 'gorra', 'gorras', 'sombrero', 'sombreros', 'cinturón', 'cinturones', 'bolso', 'bolsos', 'mochila', 'mochilas', 'calcetín', 'calcetines', 'llavero', 'llaveros', 'pack', 'set'],
                'vestido': ['camiseta', 'camisetas', 'pantalón', 'pantalones', 'falda', 'faldas', 'short', 'shorts', 'camisa', 'camisas', 'jersey', 'jerseys', 'zapato', 'zapatos', 'zapatilla', 'zapatillas', 'chaqueta', 'chaquetas', 'top', 'tops', 'sudadera', 'sudaderas', 'anillo', 'anillos', 'collar', 'collares', 'pulsera', 'pulseras', 'pendiente', 'pendientes', 'reloj', 'relojes', 'gorra', 'gorras', 'sombrero', 'sombreros', 'cinturón', 'cinturones', 'bolso', 'bolsos', 'mochila', 'mochilas', 'calcetín', 'calcetines', 'llavero', 'llaveros', 'pack', 'set'],
                'falda': ['camiseta', 'camisetas', 'pantalón', 'pantalones', 'vestido', 'vestidos', 'short', 'shorts', 'camisa', 'camisas', 'jersey', 'jerseys', 'zapato', 'zapatos', 'zapatilla', 'zapatillas', 'chaqueta', 'chaquetas', 'top', 'tops', 'sudadera', 'sudaderas', 'anillo', 'anillos', 'collar', 'collares', 'pulsera', 'pulseras', 'pendiente', 'pendientes', 'reloj', 'relojes', 'gorra', 'gorras', 'sombrero', 'sombreros', 'cinturón', 'cinturones', 'bolso', 'bolsos', 'mochila', 'mochilas', 'calcetín', 'calcetines', 'llavero', 'llaveros', 'pack', 'set'],
                'camis': ['pantalón', 'pantalones', 'vestido', 'vestidos', 'falda', 'faldas', 'short', 'shorts', 'bermuda', 'bermudas', 'jersey', 'jerseys', 'zapato', 'zapatos', 'zapatilla', 'zapatillas', 'top', 'tops', 'sudadera', 'sudaderas', 'americana', 'americanas', 'chándal', 'chandal', 'chaqueta', 'chaquetas', 'anillo', 'anillos', 'collar', 'collares', 'pulsera', 'pulseras', 'pendiente', 'pendientes', 'reloj', 'relojes', 'gorra', 'gorras', 'sombrero', 'sombreros', 'cinturón', 'cinturones', 'bolso', 'bolsos', 'mochila', 'mochilas', 'calcetín', 'calcetines', 'llavero', 'llaveros', 'pack', 'set'],
                'chaqueta': ['camiseta', 'camisetas', 'pantalón', 'pantalones', 'vestido', 'vestidos', 'falda', 'faldas', 'short', 'shorts', 'zapato', 'zapatos', 'zapatilla', 'zapatillas', 'top', 'tops', 'sudadera', 'sudaderas', 'anillo', 'anillos', 'collar', 'collares', 'pulsera', 'pulseras', 'pendiente', 'pendientes', 'reloj', 'relojes', 'gorra', 'gorras', 'sombrero', 'sombreros', 'cinturón', 'cinturones', 'bolso', 'bolsos', 'mochila', 'mochilas', 'calcetín', 'calcetines', 'llavero', 'llaveros', 'pack', 'set'],
                'jersey': ['camiseta', 'camisetas', 'pantalón', 'pantalones', 'vestido', 'vestidos', 'falda', 'faldas', 'short', 'shorts', 'zapato', 'zapatos', 'zapatilla', 'zapatillas', 'chaqueta', 'chaquetas', 'top', 'tops', 'sudadera', 'sudaderas', 'anillo', 'anillos', 'collar', 'collares', 'pulsera', 'pulseras', 'pendiente', 'pendientes', 'reloj', 'relojes', 'gorra', 'gorras', 'sombrero', 'sombreros', 'cinturón', 'cinturones', 'bolso', 'bolsos', 'mochila', 'mochilas', 'calcetín', 'calcetines', 'llavero', 'llaveros', 'pack', 'set'],
                'zapat': ['camiseta', 'camisetas', 'pantalón', 'pantalones', 'vestido', 'vestidos', 'falda', 'faldas', 'short', 'shorts', 'jersey', 'jerseys', 'chaqueta', 'chaquetas', 'camisa', 'camisas', 'top', 'tops', 'sudadera', 'sudaderas', 'anillo', 'anillos', 'collar', 'collares', 'pulsera', 'pulseras', 'pendiente', 'pendientes', 'reloj', 'relojes', 'gorra', 'gorras', 'sombrero', 'sombreros', 'cinturón', 'cinturones', 'bolso', 'bolsos', 'mochila', 'mochilas', 'calcetín', 'calcetines', 'llavero', 'llaveros', 'pack', 'set'],
                'chandal': ['camiseta', 'camisetas', 'vestido', 'vestidos', 'falda', 'faldas', 'zapato', 'zapatos', 'zapatilla', 'zapatillas', 'top', 'tops', 'anillo', 'anillos', 'collar', 'collares', 'pulsera', 'pulseras', 'pendiente', 'pendientes', 'reloj', 'relojes', 'gorra', 'gorras', 'sombrero', 'sombreros', 'cinturón', 'cinturones', 'bolso', 'bolsos', 'mochila', 'mochilas', 'calcetín', 'calcetines', 'llavero', 'llaveros', 'pack', 'set'],
                'chándal': ['camiseta', 'camisetas', 'vestido', 'vestidos', 'falda', 'faldas', 'zapato', 'zapatos', 'zapatilla', 'zapatillas', 'top', 'tops', 'anillo', 'anillos', 'collar', 'collares', 'pulsera', 'pulseras', 'pendiente', 'pendientes', 'reloj', 'relojes', 'gorra', 'gorras', 'sombrero', 'sombreros', 'cinturón', 'cinturones', 'bolso', 'bolsos', 'mochila', 'mochilas', 'calcetín', 'calcetines', 'llavero', 'llaveros', 'pack', 'set'],
                'americana': ['camiseta', 'camisetas', 'pantalón', 'pantalones', 'vestido', 'vestidos', 'falda', 'faldas', 'zapato', 'zapatos', 'zapatilla', 'zapatillas', 'top', 'tops', 'sudadera', 'sudaderas', 'anillo', 'anillos', 'collar', 'collares', 'pulsera', 'pulseras', 'pendiente', 'pendientes', 'reloj', 'relojes', 'gorra', 'gorras', 'sombrero', 'sombreros', 'cinturón', 'cinturones', 'bolso', 'bolsos', 'mochila', 'mochilas', 'calcetín', 'calcetines', 'llavero', 'llaveros', 'pack', 'set']
            };

            // Función para verificar si un producto contiene términos contradictorios
            const hasContradictoryTerms = (productName: string, searchTerm: string): boolean => {
                const productNameLower = productName.toLowerCase();

                // Determinar qué término principal estamos buscando
                let mainSearchTerm = '';
                for (const [key, expansions] of Object.entries(termExpansions)) {
                    if (searchTerm.includes(key)) {
                        mainSearchTerm = key;
                        break;
                    }
                }

                // Si no encontramos expansión, usar el término directo
                if (!mainSearchTerm) {
                    // Buscar en contradictoryTerms por coincidencia parcial
                    for (const key of Object.keys(contradictoryTerms)) {
                        if (searchTerm.includes(key)) {
                            mainSearchTerm = key;
                            break;
                        }
                    }
                }

                // Si tenemos términos contradictorios definidos para este término
                if (mainSearchTerm && contradictoryTerms[mainSearchTerm]) {
                    const contradictory = contradictoryTerms[mainSearchTerm];

                    return contradictory.some((term: string) => {
                        // Para términos específicos, ser más preciso para evitar falsos positivos
                        const preciseTerms = ['top', 'sudadera', 'sudaderas', 'americana', 'americanas', 'chándal', 'chandal', 'chaqueta', 'chaquetas', 'pack', 'set', 'llavero', 'llaveros'];

                        if (preciseTerms.includes(term)) {
                            // Usar búsqueda de palabra completa para términos precisos
                            const regex = new RegExp(`\\b${term}\\b`, 'i');
                            return regex.test(productNameLower);
                        }

                        return productNameLower.includes(term);
                    });
                }

                return false;
            };

            // Buscar si hay una expansión de término
            let searchTerms = [searchLower];
            for (const [key, expansions] of Object.entries(termExpansions)) {
                if (searchLower.includes(key)) {
                    searchTerms = expansions;
                    break;
                }
            }



            // Crear condiciones de búsqueda más precisas
            const createSearchConditions = (alias: string) => {
                const conditions: string[] = [];
                const parameters: any = {};

                searchTerms.forEach((term, index) => {
                    const paramName = `searchTerm${index}`;
                    // Búsqueda exacta al inicio (mayor relevancia)
                    conditions.push(`LOWER(${alias}.name) LIKE :${paramName}Start`);
                    parameters[`${paramName}Start`] = `${term}%`;

                    // Búsqueda de palabra completa
                    conditions.push(`LOWER(${alias}.name) LIKE :${paramName}Word`);
                    parameters[`${paramName}Word`] = `% ${term}%`;

                    // Solo si el término es largo, permitir búsqueda parcial
                    if (term.length > 3) {
                        conditions.push(`LOWER(${alias}.name) LIKE :${paramName}Partial`);
                        parameters[`${paramName}Partial`] = `%${term}%`;
                    }
                });

                return { conditions: conditions.join(' OR '), parameters };
            };

            // Paso 1: Buscar productos por nombre con scoring de relevancia
            const productSearchConditions = createSearchConditions('product');

            const productQuery = this.productRepository
                .createQueryBuilder('product')
                .leftJoin('product.subcategory', 'subcategory')
                .select([
                    'product.product_id AS product_id',
                    'product.name AS name',
                    // Calcular score de relevancia
                    `CASE 
        ${searchTerms.map((term, index) =>
                        `WHEN LOWER(product.name) LIKE '${term}%' THEN ${100 - index * 10}
             WHEN LOWER(product.name) LIKE '% ${term}%' THEN ${80 - index * 10}
             WHEN LOWER(product.name) LIKE '%${term}%' THEN ${60 - index * 10}`
                    ).join(' ')}
        ELSE 50 
    END AS relevance_score`
                ])
                .where('product.discard = false')
                .andWhere(`(${productSearchConditions.conditions})`)
                .setParameters(productSearchConditions.parameters);

            if (categoryIds && categoryIds.length > 0) {
                productQuery.andWhere('product.category_id IN (:...categoryIds)', { categoryIds });
            }

            // Paso 2: Buscar subcategorías que coincidan con el término de búsqueda
            const subcategorySearchConditions = createSearchConditions('subcategory');

            const matchingSubcategories = await this.subcategoryRepository
                .createQueryBuilder('subcategory')
                .select(['subcategory.subcategory_id'])
                .where(`(${subcategorySearchConditions.conditions})`)
                .setParameters(subcategorySearchConditions.parameters)
                .getMany();

            const subcategoryIds = matchingSubcategories.map(sc => sc.subcategory_id);

            let allProducts: any[] = [];

            // Primero obtener productos que coinciden por nombre
            const productsByName = await productQuery
                .orderBy('relevance_score', 'DESC')
                .addOrderBy('product.name', 'ASC')
                .getRawMany();

            // FILTRAR PRODUCTOS POR NOMBRE - aplicar filtro de términos contradictorios
            const filteredProductsByName = productsByName.filter(product =>
                !hasContradictoryTerms(product.name, searchLower)
            );

            allProducts = [...filteredProductsByName];

            // Si encontramos subcategorías coincidentes, buscar productos en esas subcategorías
            if (subcategoryIds.length > 0) {
                const subcategoryProductQuery = this.productRepository
                    .createQueryBuilder('product')
                    .select([
                        'product.product_id AS product_id',
                        'product.name AS name',
                        '70 AS relevance_score' // Relevancia media para coincidencias por subcategoría
                    ])
                    .where('product.discard = false')
                    .andWhere('product.subcategory_id IN (:...subcategoryIds)', { subcategoryIds });

                if (categoryIds && categoryIds.length > 0) {
                    subcategoryProductQuery.andWhere('product.category_id IN (:...categoryIds)', { categoryIds });
                }

                const productsBySubcategory = await subcategoryProductQuery
                    .orderBy('product.name', 'ASC')
                    .getRawMany();

                // Filtrar productos de subcategoría que no contengan términos contradictorios
                const validSubcategoryProducts = productsBySubcategory.filter(product =>
                    !hasContradictoryTerms(product.name, searchLower)
                );

                // Añadir productos de subcategoría que no están ya en la lista por nombre
                validSubcategoryProducts.forEach(subcatProduct => {
                    const exists = allProducts.some(p => p.product_id === subcatProduct.product_id);
                    if (!exists) {
                        allProducts.push(subcatProduct);
                    }
                });
            }

            // Eliminar duplicados y ordenar por relevancia
            const uniqueProducts = allProducts.reduce((acc: any[], current: any) => {
                const existing = acc.find(p => p.product_id === current.product_id);
                if (!existing || current.relevance_score > existing.relevance_score) {
                    if (existing) {
                        const index = acc.indexOf(existing);
                        acc[index] = current;
                    } else {
                        acc.push(current);
                    }
                }
                return acc;
            }, []);

            // Ordenar por relevancia
            uniqueProducts.sort((a, b) => {
                if (b.relevance_score !== a.relevance_score) {
                    return b.relevance_score - a.relevance_score;
                }
                return a.name.localeCompare(b.name);
            });

            // Obtener imágenes principales
            const productsWithImages = await Promise.all(
                uniqueProducts.map(async (product) => {
                    const mainImage = await this.getMainImageByProductId(product.product_id);
                    return {
                        id: product.product_id,
                        name: product.name,
                        mainImage: mainImage?.image_url || null,
                        relevance: product.relevance_score
                    };
                })
            );


            return productsWithImages;

        } catch (error) {
            console.error('Error searching products:', error);
            return [];
        }
    }

    async getProductsWithBasicInfo(
        searchText?: string,
        categoryIds?: number[]
    ): Promise<{ product_id: number, name: string, price: number, main_image: string | null }[]> {
        try {
            if (!searchText || searchText.trim().length < 2) return [];

            // Normalizar el texto de búsqueda
            const searchLower = searchText.toLowerCase().trim();

            // Expandir términos comunes para mejorar la búsqueda (MISMA LÓGICA)
            const termExpansions: { [key: string]: string[] } = {
                'pant': ['pantalón', 'pantalones'],
                'camiset': ['camiseta', 'camisetas'],
                'sudadera': ['sudadera', 'sudaderas'],
                'zapat': ['zapato', 'zapatos', 'zapatilla', 'zapatillas'],
                'jersey': ['jersey', 'jerseys', 'suéter'],
                'falda': ['falda', 'faldas'],
                'camis': ['camisa', 'camisas'],
                'chaqueta': ['chaqueta', 'chaquetas', 'cazadora', 'chándal', 'chandal', 'americana', 'americanas'],
                'chandal': ['chaqueta', 'chaquetas', 'cazadora', 'chándal', 'chandal', 'americana', 'americanas'],
                'chándal': ['chaqueta', 'chaquetas', 'cazadora', 'chándal', 'chandal', 'americana', 'americanas'],
                'americana': ['chaqueta', 'chaquetas', 'cazadora', 'chándal', 'chandal', 'americana', 'americanas']
            };

            // Lista completa de términos contradictorios (MISMA LÓGICA)
            const contradictoryTerms: { [key: string]: string[] } = {
                'pant': ['camiseta', 'camisetas', 'vestido', 'vestidos', 'falda', 'faldas', 'top', 'tops', 'camisa', 'camisas', 'jersey', 'jerseys', 'zapato', 'zapatos', 'zapatilla', 'zapatillas', 'chaqueta', 'chaquetas', 'sudadera', 'sudaderas', 'anillo', 'anillos', 'collar', 'collares', 'pulsera', 'pulseras', 'pendiente', 'pendientes', 'reloj', 'relojes', 'gorra', 'gorras', 'sombrero', 'sombreros', 'cinturón', 'cinturones', 'bolso', 'bolsos', 'mochila', 'mochilas', 'calcetín', 'calcetines', 'llavero', 'llaveros', 'pack', 'set'],
                'camiset': ['pantalón', 'pantalones', 'vestido', 'vestidos', 'falda', 'faldas', 'short', 'shorts', 'bermuda', 'bermudas', 'jersey', 'jerseys', 'zapato', 'zapatos', 'zapatilla', 'zapatillas', 'top', 'tops', 'body', 'bodies', 'sudadera', 'sudaderas', 'anillo', 'anillos', 'collar', 'collares', 'pulsera', 'pulseras', 'pendiente', 'pendientes', 'reloj', 'relojes', 'gorra', 'gorras', 'sombrero', 'sombreros', 'cinturón', 'cinturones', 'bolso', 'bolsos', 'mochila', 'mochilas', 'calcetín', 'calcetines', 'llavero', 'llaveros', 'pack', 'set'],
                'sudadera': ['camiseta', 'camisetas', 'pantalón', 'pantalones', 'vestido', 'vestidos', 'falda', 'faldas', 'zapato', 'zapatos', 'zapatilla', 'zapatillas', 'top', 'tops', 'body', 'bodies', 'camisa', 'camisas', 'anillo', 'anillos', 'collar', 'collares', 'pulsera', 'pulseras', 'pendiente', 'pendientes', 'reloj', 'relojes', 'gorra', 'gorras', 'sombrero', 'sombreros', 'cinturón', 'cinturones', 'bolso', 'bolsos', 'mochila', 'mochilas', 'calcetín', 'calcetines', 'llavero', 'llaveros', 'pack', 'set'],
                'vestido': ['camiseta', 'camisetas', 'pantalón', 'pantalones', 'falda', 'faldas', 'short', 'shorts', 'camisa', 'camisas', 'jersey', 'jerseys', 'zapato', 'zapatos', 'zapatilla', 'zapatillas', 'chaqueta', 'chaquetas', 'top', 'tops', 'sudadera', 'sudaderas', 'anillo', 'anillos', 'collar', 'collares', 'pulsera', 'pulseras', 'pendiente', 'pendientes', 'reloj', 'relojes', 'gorra', 'gorras', 'sombrero', 'sombreros', 'cinturón', 'cinturones', 'bolso', 'bolsos', 'mochila', 'mochilas', 'calcetín', 'calcetines', 'llavero', 'llaveros', 'pack', 'set'],
                'falda': ['camiseta', 'camisetas', 'pantalón', 'pantalones', 'vestido', 'vestidos', 'short', 'shorts', 'camisa', 'camisas', 'jersey', 'jerseys', 'zapato', 'zapatos', 'zapatilla', 'zapatillas', 'chaqueta', 'chaquetas', 'top', 'tops', 'sudadera', 'sudaderas', 'anillo', 'anillos', 'collar', 'collares', 'pulsera', 'pulseras', 'pendiente', 'pendientes', 'reloj', 'relojes', 'gorra', 'gorras', 'sombrero', 'sombreros', 'cinturón', 'cinturones', 'bolso', 'bolsos', 'mochila', 'mochilas', 'calcetín', 'calcetines', 'llavero', 'llaveros', 'pack', 'set'],
                'camis': ['pantalón', 'pantalones', 'vestido', 'vestidos', 'falda', 'faldas', 'short', 'shorts', 'bermuda', 'bermudas', 'jersey', 'jerseys', 'zapato', 'zapatos', 'zapatilla', 'zapatillas', 'top', 'tops', 'sudadera', 'sudaderas', 'americana', 'americanas', 'chándal', 'chandal', 'chaqueta', 'chaquetas', 'anillo', 'anillos', 'collar', 'collares', 'pulsera', 'pulseras', 'pendiente', 'pendientes', 'reloj', 'relojes', 'gorra', 'gorras', 'sombrero', 'sombreros', 'cinturón', 'cinturones', 'bolso', 'bolsos', 'mochila', 'mochilas', 'calcetín', 'calcetines', 'llavero', 'llaveros', 'pack', 'set'],
                'chaqueta': ['camiseta', 'camisetas', 'pantalón', 'pantalones', 'vestido', 'vestidos', 'falda', 'faldas', 'short', 'shorts', 'zapato', 'zapatos', 'zapatilla', 'zapatillas', 'top', 'tops', 'sudadera', 'sudaderas', 'anillo', 'anillos', 'collar', 'collares', 'pulsera', 'pulseras', 'pendiente', 'pendientes', 'reloj', 'relojes', 'gorra', 'gorras', 'sombrero', 'sombreros', 'cinturón', 'cinturones', 'bolso', 'bolsos', 'mochila', 'mochilas', 'calcetín', 'calcetines', 'llavero', 'llaveros', 'pack', 'set'],
                'jersey': ['camiseta', 'camisetas', 'pantalón', 'pantalones', 'vestido', 'vestidos', 'falda', 'faldas', 'short', 'shorts', 'zapato', 'zapatos', 'zapatilla', 'zapatillas', 'chaqueta', 'chaquetas', 'top', 'tops', 'sudadera', 'sudaderas', 'anillo', 'anillos', 'collar', 'collares', 'pulsera', 'pulseras', 'pendiente', 'pendientes', 'reloj', 'relojes', 'gorra', 'gorras', 'sombrero', 'sombreros', 'cinturón', 'cinturones', 'bolso', 'bolsos', 'mochila', 'mochilas', 'calcetín', 'calcetines', 'llavero', 'llaveros', 'pack', 'set'],
                'zapat': ['camiseta', 'camisetas', 'pantalón', 'pantalones', 'vestido', 'vestidos', 'falda', 'faldas', 'short', 'shorts', 'jersey', 'jerseys', 'chaqueta', 'chaquetas', 'camisa', 'camisas', 'top', 'tops', 'sudadera', 'sudaderas', 'anillo', 'anillos', 'collar', 'collares', 'pulsera', 'pulseras', 'pendiente', 'pendientes', 'reloj', 'relojes', 'gorra', 'gorras', 'sombrero', 'sombreros', 'cinturón', 'cinturones', 'bolso', 'bolsos', 'mochila', 'mochilas', 'calcetín', 'calcetines', 'llavero', 'llaveros', 'pack', 'set'],
                'chandal': ['camiseta', 'camisetas', 'vestido', 'vestidos', 'falda', 'faldas', 'zapato', 'zapatos', 'zapatilla', 'zapatillas', 'top', 'tops', 'anillo', 'anillos', 'collar', 'collares', 'pulsera', 'pulseras', 'pendiente', 'pendientes', 'reloj', 'relojes', 'gorra', 'gorras', 'sombrero', 'sombreros', 'cinturón', 'cinturones', 'bolso', 'bolsos', 'mochila', 'mochilas', 'calcetín', 'calcetines', 'llavero', 'llaveros', 'pack', 'set'],
                'chándal': ['camiseta', 'camisetas', 'vestido', 'vestidos', 'falda', 'faldas', 'zapato', 'zapatos', 'zapatilla', 'zapatillas', 'top', 'tops', 'anillo', 'anillos', 'collar', 'collares', 'pulsera', 'pulseras', 'pendiente', 'pendientes', 'reloj', 'relojes', 'gorra', 'gorras', 'sombrero', 'sombreros', 'cinturón', 'cinturones', 'bolso', 'bolsos', 'mochila', 'mochilas', 'calcetín', 'calcetines', 'llavero', 'llaveros', 'pack', 'set'],
                'americana': ['camiseta', 'camisetas', 'pantalón', 'pantalones', 'vestido', 'vestidos', 'falda', 'faldas', 'zapato', 'zapatos', 'zapatilla', 'zapatillas', 'top', 'tops', 'sudadera', 'sudaderas', 'anillo', 'anillos', 'collar', 'collares', 'pulsera', 'pulseras', 'pendiente', 'pendientes', 'reloj', 'relojes', 'gorra', 'gorras', 'sombrero', 'sombreros', 'cinturón', 'cinturones', 'bolso', 'bolsos', 'mochila', 'mochilas', 'calcetín', 'calcetines', 'llavero', 'llaveros', 'pack', 'set']
            };

            // Función para verificar si un producto contiene términos contradictorios (MISMA LÓGICA)
            const hasContradictoryTerms = (productName: string, searchTerm: string): boolean => {
                const productNameLower = productName.toLowerCase();

                // Determinar qué término principal estamos buscando
                let mainSearchTerm = '';
                for (const [key, expansions] of Object.entries(termExpansions)) {
                    if (searchTerm.includes(key)) {
                        mainSearchTerm = key;
                        break;
                    }
                }

                // Si no encontramos expansión, usar el término directo
                if (!mainSearchTerm) {
                    // Buscar en contradictoryTerms por coincidencia parcial
                    for (const key of Object.keys(contradictoryTerms)) {
                        if (searchTerm.includes(key)) {
                            mainSearchTerm = key;
                            break;
                        }
                    }
                }

                // Si tenemos términos contradictorios definidos para este término
                if (mainSearchTerm && contradictoryTerms[mainSearchTerm]) {
                    const contradictory = contradictoryTerms[mainSearchTerm];

                    return contradictory.some((term: string) => {
                        // Para términos específicos, ser más preciso para evitar falsos positivos
                        const preciseTerms = ['top', 'sudadera', 'sudaderas', 'americana', 'americanas', 'chándal', 'chandal', 'chaqueta', 'chaquetas', 'pack', 'set', 'llavero', 'llaveros'];

                        if (preciseTerms.includes(term)) {
                            // Usar búsqueda de palabra completa para términos precisos
                            const regex = new RegExp(`\\b${term}\\b`, 'i');
                            return regex.test(productNameLower);
                        }

                        return productNameLower.includes(term);
                    });
                }

                return false;
            };

            // Buscar si hay una expansión de término (MISMA LÓGICA)
            let searchTerms = [searchLower];
            for (const [key, expansions] of Object.entries(termExpansions)) {
                if (searchLower.includes(key)) {
                    searchTerms = expansions;
                    break;
                }
            }



            // Crear condiciones de búsqueda más precisas (MISMA LÓGICA)
            const createSearchConditions = (alias: string) => {
                const conditions: string[] = [];
                const parameters: any = {};

                searchTerms.forEach((term, index) => {
                    const paramName = `searchTerm${index}`;
                    // Búsqueda exacta al inicio (mayor relevancia)
                    conditions.push(`LOWER(${alias}.name) LIKE :${paramName}Start`);
                    parameters[`${paramName}Start`] = `${term}%`;

                    // Búsqueda de palabra completa
                    conditions.push(`LOWER(${alias}.name) LIKE :${paramName}Word`);
                    parameters[`${paramName}Word`] = `% ${term}%`;

                    // Solo si el término es largo, permitir búsqueda parcial
                    if (term.length > 3) {
                        conditions.push(`LOWER(${alias}.name) LIKE :${paramName}Partial`);
                        parameters[`${paramName}Partial`] = `%${term}%`;
                    }
                });

                return { conditions: conditions.join(' OR '), parameters };
            };

            // Paso 1: Buscar productos por nombre con scoring de relevancia
            const productSearchConditions = createSearchConditions('product');

            const productQuery = this.productRepository
                .createQueryBuilder('product')
                .leftJoin('product.subcategory', 'subcategory')
                .leftJoin(
                    'product.images',
                    'image',
                    'image.is_main = :isMain',
                    { isMain: true }
                )
                .select([
                    'product.product_id AS product_id',
                    'product.name AS name',
                    'product.price AS price',
                    'image.image_url AS main_image',
                    // Calcular score de relevancia
                    `CASE 
    ${searchTerms.map((term, index) =>
                        `WHEN LOWER(product.name) LIKE '${term}%' THEN ${100 - index * 10}
         WHEN LOWER(product.name) LIKE '% ${term}%' THEN ${80 - index * 10}
         WHEN LOWER(product.name) LIKE '%${term}%' THEN ${60 - index * 10}`
                    ).join(' ')}
    ELSE 50 
END AS relevance_score`
                ])
                .where('product.discard = false')
                .andWhere(`(${productSearchConditions.conditions})`)
                .setParameters(productSearchConditions.parameters);

            if (categoryIds && categoryIds.length > 0) {
                productQuery.andWhere('product.category_id IN (:...categoryIds)', { categoryIds });
            }

            // Paso 2: Buscar subcategorías que coincidan con el término de búsqueda
            const subcategorySearchConditions = createSearchConditions('subcategory');

            const matchingSubcategories = await this.subcategoryRepository
                .createQueryBuilder('subcategory')
                .select(['subcategory.subcategory_id'])
                .where(`(${subcategorySearchConditions.conditions})`)
                .setParameters(subcategorySearchConditions.parameters)
                .getMany();

            const subcategoryIds = matchingSubcategories.map(sc => sc.subcategory_id);

            let allProducts: any[] = [];

            // Primero obtener productos que coinciden por nombre
            const productsByName = await productQuery
                .orderBy('relevance_score', 'DESC')
                .addOrderBy('product.name', 'ASC')
                .getRawMany();

            // FILTRAR PRODUCTOS POR NOMBRE - aplicar filtro de términos contradictorios
            const filteredProductsByName = productsByName.filter(product =>
                !hasContradictoryTerms(product.name, searchLower)
            );

            allProducts = [...filteredProductsByName];

            // Si encontramos subcategorías coincidentes, buscar productos en esas subcategorías
            if (subcategoryIds.length > 0) {
                const subcategoryProductQuery = this.productRepository
                    .createQueryBuilder('product')
                    .leftJoin(
                        'product.images',
                        'image',
                        'image.is_main = :isMain',
                        { isMain: true }
                    )
                    .select([
                        'product.product_id AS product_id',
                        'product.name AS name',
                        'product.price AS price',
                        'image.image_url AS main_image',
                        '70 AS relevance_score' // Relevancia media para coincidencias por subcategoría
                    ])
                    .where('product.discard = false')
                    .andWhere('product.subcategory_id IN (:...subcategoryIds)', { subcategoryIds });

                if (categoryIds && categoryIds.length > 0) {
                    subcategoryProductQuery.andWhere('product.category_id IN (:...categoryIds)', { categoryIds });
                }

                const productsBySubcategory = await subcategoryProductQuery
                    .orderBy('product.name', 'ASC')
                    .getRawMany();

                // Filtrar productos de subcategoría que no contengan términos contradictorios
                const validSubcategoryProducts = productsBySubcategory.filter(product =>
                    !hasContradictoryTerms(product.name, searchLower)
                );

                // Añadir productos de subcategoría que no están ya en la lista por nombre
                validSubcategoryProducts.forEach(subcatProduct => {
                    const exists = allProducts.some(p => p.product_id === subcatProduct.product_id);
                    if (!exists) {
                        allProducts.push(subcatProduct);
                    }
                });
            }

            // Eliminar duplicados y ordenar por relevancia
            const uniqueProducts = allProducts.reduce((acc: any[], current: any) => {
                const existing = acc.find(p => p.product_id === current.product_id);
                if (!existing || current.relevance_score > existing.relevance_score) {
                    if (existing) {
                        const index = acc.indexOf(existing);
                        acc[index] = current;
                    } else {
                        acc.push(current);
                    }
                }
                return acc;
            }, []);

            // Ordenar por relevancia
            uniqueProducts.sort((a, b) => {
                if (b.relevance_score !== a.relevance_score) {
                    return b.relevance_score - a.relevance_score;
                }
                return a.name.localeCompare(b.name);
            });

            // Formatear resultados finales
            return uniqueProducts.map(product => ({
                product_id: product.product_id,
                name: product.name,
                price: product.price,
                main_image: product.main_image || null
            }));

        } catch (error) {
            console.error('Error fetching products with basic info:', error);
            return [];
        }
    }



}