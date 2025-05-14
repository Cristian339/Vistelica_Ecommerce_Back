import { Repository } from "typeorm";
import { AppDataSource } from "../Config/database";
import { StyleImage } from "../Entities/StyleImage";

export class StyleImageRepository {
    private repo: Repository<StyleImage>;

    constructor() {
        this.repo = AppDataSource.getRepository(StyleImage);
    }

    // Create an entity instance
    create(data: Partial<StyleImage>): StyleImage {
        return this.repo.create(data);
    }

    // Save an entity
    async save(image: StyleImage): Promise<StyleImage> {
        return await this.repo.save(image);
    }

    // Get all style images
    async findAll(): Promise<StyleImage[]> {
        return await this.repo.find({ relations: ["style"] });
    }

    // Get a style image by ID
    async findById(imageId: number): Promise<StyleImage | null> {
        return await this.repo.findOne({
            where: { image_id: imageId },
            relations: ["style"],
        });
    }

    // Find images by style ID
    async findByStyle(styleId: number): Promise<StyleImage[]> {
        return await this.repo.find({
            where: { style: { style_id: styleId } },
            relations: ["style"]
        });
    }

    // Find main image for a style
    async findMainImageByStyle(styleId: number): Promise<StyleImage | null> {
        return await this.repo.findOne({
            where: {
                style: { style_id: styleId },
                is_main: true
            },
            relations: ["style"]
        });
    }

    // Update a style image
    async update(imageId: number, data: Partial<StyleImage>): Promise<StyleImage | null> {
        await this.repo.update(imageId, data);
        return await this.findById(imageId);
    }

    // Delete a style image
    async delete(imageId: number): Promise<void> {
        await this.repo.delete(imageId);
    }
}