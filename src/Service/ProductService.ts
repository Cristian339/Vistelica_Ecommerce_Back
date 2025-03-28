import { AppDataSource } from '../Config/database'; // Asegúrate de importar la fuente de datos correcta
import { Products } from '../Entities/Products';
import { Category } from "../Entities/Category";
import { Subcategory } from "../Entities/Subcategory";
import { uploadImage } from '../Config/Cloudinary';


export class ProductService {

    private productRepository = AppDataSource.getRepository(Products); // Repositorio de Products
    private categoryRepository = AppDataSource.getRepository(Category);
    private subcategoryRepository = AppDataSource.getRepository(Subcategory);


    // Crear un nuevo producto
    async createProduct(data: Partial<Products>): Promise<Products> {
        try {
            console.log('Datos recibidos:', data);

            // Verifica si la categoría y subcategoría existen por su ID
            const category = await this.categoryRepository.findOne({ where: { category_id: data.category?.category_id } });
            const subcategory = await this.subcategoryRepository.findOne({ where: { subcategory_id: data.subcategory?.subcategory_id } });

            console.log('Categoría encontrada:', category);
            console.log('Subcategoría encontrada:', subcategory);

            // Asegúrate de que la categoría y subcategoría existen
            if (!category || !subcategory) {
                throw new Error("Category or Subcategory not found");
            }

            // Crear el producto utilizando solo los IDs de las relaciones
            const product = this.productRepository.create({
                ...data, // Tomará directamente los valores de category_id y subcategory_id
                category: category,
                subcategory: subcategory,
                discount_percentage: data.discount_percentage ?? undefined,  // Asegurarse de que el descuento sea nulo si no se pasa
            });

            // Guarda el producto en la base de datos
            const savedProduct = await this.productRepository.save(product);
            console.log('Producto guardado:', savedProduct);

            return savedProduct; // Devuelve el producto guardado
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
            const product = await this.productRepository.findOne({
                where: { product_id: id },
                relations: ['category', 'subcategory'], // Cargar las relaciones de categoría y subcategoría
            });

            if (!product) {
                throw new Error('Product not found');
            }

            // Si se proporciona una nueva categoría o subcategoría, buscar y asignar las relaciones correctas
            if (data.category) {
                const category = await this.categoryRepository.findOne({ where: { category_id: data.category.category_id } });
                if (category) {
                    product.category = category;
                } else {
                    throw new Error('Category not found');
                }
            }

            if (data.subcategory) {
                const subcategory = await this.subcategoryRepository.findOne({ where: { subcategory_id: data.subcategory.subcategory_id } });
                if (subcategory) {
                    product.subcategory = subcategory;
                } else {
                    throw new Error('Subcategory not found');
                }
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


}