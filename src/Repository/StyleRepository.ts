import { Repository } from "typeorm";
import { AppDataSource } from "../Config/database";
import { Style } from "../Entities/Style";

export class StyleRepository {
    private repo: Repository<Style>;

    constructor() {
        this.repo = AppDataSource.getRepository(Style);
    }

    // Create an entity instance
    create(data: Partial<Style>): Style {
        return this.repo.create(data);
    }

    // Save an entity
    async save(style: Style): Promise<Style> {
        return await this.repo.save(style);
    }

    // Create and save a style (older method, kept for compatibility)
    async createStyle(data: Partial<Style>): Promise<Style> {
        const style = this.repo.create(data);
        return await this.repo.save(style);
    }

    // Get all styles
    async findAll(): Promise<Style[]> {
        return await this.repo.find({ relations: ["styleImages", "category", "products"] });
    }

    // Get a style by ID
    async findById(styleId: number): Promise<Style | null> {
        return await this.repo.findOne({
            where: { style_id: styleId },
            relations: ["styleImages", "category", "products"],
        });
    }

    // Find styles by category
    async findByCategory(categoryId: number): Promise<Style[]> {
        return await this.repo.find({
            where: { category: { category_id: categoryId } },
            relations: ["styleImages", "category", "products"]
        });
    }

    // Find styles by name
    async findByName(name: string): Promise<Style[]> {
        return await this.repo.find({
            where: { name: name },
            relations: ["styleImages", "category", "products"]
        });
    }

    // Update a style
    async update(styleId: number, data: Partial<Style>): Promise<Style | null> {
        await this.repo.update(styleId, data);
        return await this.findById(styleId);
    }

    // Delete a style
    async delete(styleId: number): Promise<void> {
        await this.repo.delete(styleId);
    }

    async findOne(options: {
        where: { style_id: number };
        relations: string[];
    }): Promise<Style | null> {
        return await this.repo.findOne({
            where: options.where,
            relations: options.relations,
        });
    }
}