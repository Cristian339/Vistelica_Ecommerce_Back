import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany
} from "typeorm";
import { Subcategory } from "./Subcategory";
import { Category } from "./Category";
import {ProductReview} from "./ProductReview";

export enum Size {
    XS = "XS",
    S = "S",
    M = "M",
    L = "L",
    XL = "XL",
    XXL = "XXL"
}

@Entity({ schema: 'vistelica' })
export class Products {
    @PrimaryGeneratedColumn()
    product_id: number;

    @Column({ length: 100 })
    name: string;

    @Column("text")
    description: string;

    @Column("decimal", { precision: 10, scale: 2 })
    price: number;

    @Column("int")
    stock_quantity: number;

    @ManyToOne(() => Category, (category) => category.products, { nullable: true, onDelete: "CASCADE" })
    category: Category; // Relación obligatoria con Category

    @ManyToOne(() => Subcategory, (subcategory) => subcategory.products, { nullable: true, onDelete: "SET NULL" })
    subcategory: Subcategory;
    @OneToMany(() => ProductReview, (review) => review.product)
    reviews: ProductReview[];

    @Column({ nullable: true })
    image_url: string;

    @Column({ type: "enum", enum: Size, nullable: true })
    size: Size;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    constructor(product_id: number, name: string, description: string, price: number, stock_quantity: number, category: Category, subcategory: Subcategory, reviews: ProductReview[], image_url: string, size: Size, created_at: Date, updated_at: Date) {
        this.product_id = product_id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.stock_quantity = stock_quantity;
        this.category = category;
        this.subcategory = subcategory;
        this.reviews = reviews;
        this.image_url = image_url;
        this.size = size;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}
