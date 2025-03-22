import { AppDataSource } from '../Config/database'; // Asegúrate de importar la fuente de datos correcta
import { Products } from '../Entities/Products';

export class ProductService {

    private productRepository = AppDataSource.getRepository(Products); // Repositorio de Products

    // Crear un nuevo producto
    async createProduct(data: Partial<Products>): Promise<Products> {
        const product = this.productRepository.create(data); // Crear una nueva entidad Products
        return await this.productRepository.save(product); // Guardar el producto en la base de datos
    }

    // Obtener todos los productos
    async getAllProducts(): Promise<Products[]> {
        try {
            console.log('Consultando todos los productos...');
            const products = await this.productRepository.find(); // Traer todos los productos
            console.log('Productos obtenidos:', products);
            return products; // Devolver los productos obtenidos
        } catch (error) {
            console.error('Error al obtener productos:', error);
            throw new Error('Error al obtener productos');
        }
    }

    // Obtener un producto por su ID
    async getProductById(id: number): Promise<Products | null> {
        try {
            const product = await this.productRepository.findOneBy({ product_id: id });
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
            const product = await this.productRepository.findOneBy({ product_id: id });
            if (!product) {
                throw new Error('Product not found');
            }
            Object.assign(product, data);
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
                where: { subcategory: { category: { category_id: categoryId }, subcategory_id: subcategoryId } },
                relations: ['subcategory', 'subcategory.category']
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
            const product = await this.productRepository.findOneBy({ product_id: id });
            if (!product) {
                throw new Error('Product not found');
            }
            await this.productRepository.delete(id);
            return product;
        } catch (error) {
            console.error('Error deleting product:', error);
            throw new Error('Error deleting product');
        }
    }
}