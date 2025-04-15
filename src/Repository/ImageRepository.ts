
import { ProductImage } from '../Entities/ProductImage';
import {Repository} from "typeorm";


export class ProductImageRepository extends Repository<ProductImage> {

    // Método para encontrar todas las imágenes de un producto
    async findImagesByProductId(productId: number): Promise<ProductImage[]> {
        return this.find({
            where: { product: { product_id: productId } },
        });
    }

    // Método para encontrar la imagen principal de un producto
    async findMainImageByProductId(productId: number): Promise<ProductImage | undefined> {
        return this.findOne({
            where: { product: { product_id: productId }, is_main: true },
        });
    }

    // Método para agregar una nueva imagen al producto
    async addImagesToProduct(images: ProductImage[]): Promise<ProductImage[]> {
        return this.save(images); // Guarda múltiples imágenes
    }

    // Método para eliminar las imágenes de un producto
    async removeImagesByProductId(productId: number): Promise<void> {
        await this.delete({ product: { product_id: productId } });
    }
}
