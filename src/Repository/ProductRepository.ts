import { Repository } from "typeorm";
import { AppDataSource } from "../Config/database";
import { Products } from "../Entities/Products";
import {ProductOverviewDto} from "../DTO/ProductOverviewDto";

export class ProductRepository {
    private repo: Repository<Products>;

    constructor() {
        this.repo = AppDataSource.getRepository(Products);
    }

    // Crear un nuevo producto
    async createProduct(data: Partial<Products>): Promise<Products> {
        const product = this.repo.create(data);
        return await this.repo.save(product);
    }

    // Obtener todos los productos
    async getAllProducts(): Promise<Products[]> {
        try {
            const products = await this.repo.find();
            return products;
        } catch (error) {
            console.error('Error fetching products:', error);
            throw new Error('Error fetching products');
        }
    }

    // Eliminar un producto
    async deleteProduct(id: number): Promise<void> {
        await this.repo.delete(id);
    }

    // Obtener 10 productos aleatorios con información destacada
    async getRandomFeaturedProducts(): Promise<ProductOverviewDto[]> {
        return this.repo
            .createQueryBuilder("product")
            .leftJoin("product.reviews", "review")
            .leftJoin("product.subcategory", "subcategory")
            .leftJoin(
                qb => qb
                    .from("product_image", "img")
                    .where("img.is_main = true"),
                "main_image",
                "main_image.product_id = product.product_id"
            )
            .select([
                "product.product_id AS product_id",
                "product.name AS name",
                "product.price AS price",
                "product.colors AS colors",
                "subcategory.name AS subcategory_name",
                "main_image.image_url AS main_image"
            ])
            .addSelect("AVG(review.rating)", "average_rating")
            .groupBy("product.product_id")
            .addGroupBy("subcategory.name")
            .addGroupBy("main_image.image_url")
            .orderBy("RANDOM()")
            .limit(10)
            .getRawMany();
    }


    async getFirstTenProducts(): Promise<ProductOverviewDto[]> {
        return this.repo
            .createQueryBuilder("product")
            .leftJoin("product.reviews", "review")
            .leftJoin("product.subcategory", "subcategory")
            .leftJoin(
                qb => qb
                    .from("product_image", "img")
                    .where("img.is_main = true"),
                "main_image",
                "main_image.product_id = product.product_id"
            )
            .select([
                "product.product_id AS product_id",
                "product.name AS name",
                "product.price AS price",
                "product.colors AS colors",
                "subcategory.name AS subcategory_name",
                "main_image.image_url AS main_image"
            ])
            .addSelect("AVG(review.rating)", "average_rating")
            .groupBy("product.product_id")
            .addGroupBy("subcategory.name")
            .addGroupBy("main_image.image_url")
            .orderBy("product.product_id", "ASC")
            .limit(10)
            .getRawMany();
    }
    async getTopRatedFeaturedProducts(): Promise<ProductOverviewDto[]> {
        return this.repo
            .createQueryBuilder("product")
            .leftJoin("product.reviews", "review")
            .leftJoin("product.subcategory", "subcategory")
            .leftJoin(
                qb => qb
                    .from("product_image", "img")
                    .where("img.is_main = true"),
                "main_image",
                "main_image.product_id = product.product_id"
            )
            .select([
                "product.product_id AS product_id",
                "product.name AS name",
                "product.price AS price",
                "product.colors AS colors",
                "subcategory.name AS subcategory_name",
                "main_image.image_url AS main_image"
            ])
            .addSelect("AVG(review.rating)", "average_rating")
            .addSelect("COUNT(review.review_id)", "reviews_count")
            .groupBy("product.product_id")
            .addGroupBy("subcategory.name")
            .addGroupBy("main_image.image_url")
            .having("AVG(review.rating) IS NOT NULL")
            .orderBy("average_rating", "DESC")
            .limit(8)
            .getRawMany();
    }
    async getRandomFeaturedAccessoryProducts(): Promise<ProductOverviewDto[]> {
        return this.repo
            .createQueryBuilder("product")
            .leftJoin("product.reviews", "review")
            .leftJoin("product.subcategory", "subcategory")
            .leftJoin(
                qb => qb
                    .from("product_image", "img")
                    .where("img.is_main = true"),
                "main_image",
                "main_image.product_id = product.product_id"
            )
            .select([
                "product.product_id AS product_id",
                "product.name AS name",
                "product.price AS price",
                "product.colors AS colors",
                "subcategory.name AS subcategory_name",
                "main_image.image_url AS main_image"
            ])
            .addSelect("AVG(review.rating)", "average_rating")
            .where("LOWER(subcategory.name) LIKE :subcategoryName", { subcategoryName: 'accesorios%' })
            .groupBy("product.product_id")
            .addGroupBy("subcategory.name")
            .addGroupBy("main_image.image_url")
            .orderBy("RANDOM()")
            .limit(10)
            .getRawMany();
    }



}
