import { AppDataSource } from '../Config/database'; // Asegúrate de importar la fuente de datos correcta
import { Products } from '../Entities/Products';
import { Category } from "../Entities/Category";
import { Subcategory } from "../Entities/Subcategory";
import { uploadImage } from '../Config/Cloudinary';
import {where} from "sequelize";
import {ProductImage} from "../Entities/ProductImage";


export class ProductService {

    private productRepository = AppDataSource.getRepository(Products); // Repositorio de Products
    private categoryRepository = AppDataSource.getRepository(Category);
    private subcategoryRepository = AppDataSource.getRepository(Subcategory);
    private imageRepository = AppDataSource.getRepository(ProductImage); // Repositorio de imágenes (ajusta según tu configuración)


    // Crear un nuevo producto
    async createProduct(data: Partial<Products>, images: { image_url: string, is_main: boolean }[]): Promise<Products> {
        try {
            // Buscar la categoría y subcategoría por sus ID
            const category = await this.categoryRepository.findOne({
                where: { category_id: data.category?.category_id }, // Usa la relación category
            });

            const subcategory = await this.subcategoryRepository.findOne({
                where: { subcategory_id: data.subcategory?.subcategory_id }, // Usa la relación subcategory
            });

            if (!category || !subcategory) {
                throw new Error("Categoria o subcategoria no encontradas");
            }

            // Crear el producto
            const product = this.productRepository.create({
                ...data,
                category, // Asocia la categoría encontrada
                subcategory, // Asocia la subcategoría encontrada
                discount_percentage: data.discount_percentage ?? null,
            });

            const savedProduct = await this.productRepository.save(product);

            // Asociar imágenes al producto
            for (const img of images) {
                const newImage = this.imageRepository.create({
                    image_url: img.image_url,
                    is_main: img.is_main,
                    product: savedProduct, // Asocia la imagen al producto
                });
                await this.imageRepository.save(newImage); // Guarda la imagen en la base de datos
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

            // Obtenemos los productos con las relaciones de categoría y subcategoría
            const products = await this.productRepository.find({
                relations: ['category', 'subcategory'], // Asegúrate de incluir las relaciones
            });

            // Extraemos solo las IDs de categoría y subcategoría junto con los productos
            const productsWithCategoryAndSubcategory = products.map(product => ({
                ...product,
                categoryId: product.category?.category_id,    // ID de la categoría
                subcategoryId: product.subcategory?.subcategory_id,  // ID de la subcategoría
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
                relations: ['category', 'subcategory'], // Cargar las relaciones de categoría y subcategoría
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
                relations: ['category', 'subcategory'], // Cargar las relaciones de categoría y subcategoría
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
                    category: { category_id: categoryId }, // Filtrar por la categoría
                    subcategory: { subcategory_id: subcategoryId } // Filtrar por la subcategoría
                },
                relations: ['category', 'subcategory'] // Asegúrate de que las relaciones se carguen correctamente
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
                relations: ['category', 'subcategory'], // Aseguramos que se traigan las relaciones
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


}