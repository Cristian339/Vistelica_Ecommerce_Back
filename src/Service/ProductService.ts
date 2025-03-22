import { AppDataSource } from '../Config/database'; // Asegúrate de importar la fuente de datos correcta
import { Product } from '../Entities/Product';

export class ProductService {

    private productRepository = AppDataSource.getRepository(Product); // Repositorio de Product

    // Crear un nuevo producto
    async createProduct(data: Partial<Product>): Promise<Product> {
        const product = this.productRepository.create(data); // Crear una nueva entidad Product
        return await this.productRepository.save(product); // Guardar el producto en la base de datos
    }

    // Obtener todos los productos
    async getAllProducts(): Promise<Product[]> {
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
    async getProductById(id: number): Promise<Product | null> {
        try {
            const product = await this.productRepository.findOneBy({ product_id: id }); // Buscar el producto por ID
            if (!product) {
                throw new Error('Product not found');
            }
            return product;
        } catch (error) {
            console.error('Error fetching product by id:', error);
            throw new Error('Error fetching product by id');
        }
    }

    // Eliminar un producto por su ID
    async deleteProduct(id: number): Promise<void> {
        try {
            const result = await this.productRepository.delete(id); // Eliminar el producto por su ID
            if (result.affected === 0) {
                throw new Error('Product not found'); // Si no se elimina ningún producto, lanzamos un error
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            throw new Error('Error deleting product');
        }
    }
}
