import { AppDataSource } from '../Config/database';
import { ProductImageDto } from '../Dto/ProductImageDto';
import { Color, Products, Size } from '../Entities/Products';
import { Category } from "../Entities/Category";
import { Subcategory } from "../Entities/Subcategory";
import { uploadImage } from '../Config/Cloudinary';
import { ProductImage } from "../Entities/ProductImage";

export class ProductService {
    private productRepository = AppDataSource.getRepository(Products);
    private categoryRepository = AppDataSource.getRepository(Category);
    private subcategoryRepository = AppDataSource.getRepository(Subcategory);
    private imageRepository = AppDataSource.getRepository(ProductImage);


    // Crear un nuevo producto
    async createProduct(data: Partial<Products>, images: { image_url: string, is_main: boolean }[]): Promise<Products> {
        try {
            console.log("imagenes pasadas"+images);
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
            console.log("produto guardado"+ savedProduct);
            for (const img of images) {
                console.log("La imagen"+img);
                const newImage = this.imageRepository.create({
                    image_url: img.image_url,
                    is_main: img.is_main,
                    product: savedProduct,
                });
                console.log("La imagen puesta"+newImage);
                await this.imageRepository.save(newImage);
            }

            return savedProduct;
        } catch (error) {
            console.error('Error al crear producto:', error);
            throw new Error("Error creating product");
        }
    }

    // Obtener todos los productos
    async getAllProducts(): Promise<Products[]> {
        try {
            console.log('Consultando todos los productos...');

            const products = await this.productRepository.find({
                relations: ['category', 'subcategory'],
            });

            const productsWithCategoryAndSubcategory = products.map(product => ({
                ...product,
                categoryId: product.category?.category_id,
                subcategoryId: product.subcategory?.subcategory_id,
            }));

            console.log('Productos obtenidos:', productsWithCategoryAndSubcategory);
            return productsWithCategoryAndSubcategory;
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
                    'category',
                    'subcategory',
                    'images'
                ],
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
            console.log('Datos recibidos:', data);

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
    async getProductsByCategoryAndSubcategory(categoryId: number, subcategoryId: number): Promise<Products[]> {
        try {
            const products = await this.productRepository.find({
                where: {
                    category: { category_id: categoryId },
                    subcategory: { subcategory_id: subcategoryId }
                },
                relations: ['category', 'subcategory']
            });
            return products;
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
    ): Promise<{ id: number; name: string; mainImage: string | null }[]> {
        try {
            // Construimos la consulta base
            const query = this.productRepository.createQueryBuilder('product')
                .select(['product.product_id', 'product.name'])
                .where('product.discard = false');

            // Aplicamos filtros según los parámetros
            if (searchText) {
                query.andWhere('LOWER(product.name) LIKE :searchText', {
                    searchText: `%${searchText.toLowerCase()}%`
                });
            }

            if (categoryIds && categoryIds.length > 0) {
                query.andWhere('product.category_id IN (:...categoryIds)', { categoryIds });
            }

            // Ordenamos y obtenemos los resultados
            query.orderBy('product.name', 'ASC');
            const products = await query.getMany();

            // Obtenemos las imágenes principales para cada producto
            const productsWithImages = await Promise.all(
                products.map(async (product) => {
                    const mainImage = await this.getMainImageByProductId(product.product_id);
                    return {
                        id: product.product_id,
                        name: product.name,
                        mainImage: mainImage?.image_url || null
                    };
                })
            );

            return productsWithImages;
        } catch (error) {
            console.error('Error searching products:', error);
            throw new Error('Error searching products');
        }
    }



    async getProductsWithBasicInfo(
        searchText?: string,
        categoryIds?: number[]
    ): Promise<{ product_id: number, name: string, price: number, main_image: string | null }[]> {
        try {
            const query = this.productRepository
                .createQueryBuilder('product')
                .leftJoinAndSelect(
                    'product.images',
                    'image',
                    'image.is_main = :isMain',
                    { isMain: true }
                )
                .select([
                    'product.product_id',
                    'product.name',
                    'product.price',
                    'image.image_url as main_image'
                ])
                .where('product.discard = :discard', { discard: false });

            // Filtro por texto en el nombre
            if (searchText) {
                query.andWhere('LOWER(product.name) LIKE :searchText', {
                    searchText: `%${searchText.toLowerCase()}%`
                });
            }

            // Filtro por categorías si hay
            if (categoryIds && categoryIds.length > 0) {
                query.andWhere('product.category_id IN (:...categoryIds)', { categoryIds });
            }

            query.orderBy('product.name', 'ASC');

            const rawResults = await query.getRawMany();

            // Mapeamos los resultados para asegurar el formato correcto
            return rawResults.map(row => ({
                product_id: row.product_product_id,
                name: row.product_name,
                price: row.product_price,
                main_image: row.main_image || null
            }));
        } catch (error) {
            console.error('Error fetching products with basic info:', error);
            throw new Error('Error fetching products with basic info');
        }
    }


}