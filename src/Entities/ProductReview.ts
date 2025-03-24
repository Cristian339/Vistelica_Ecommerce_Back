import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { User } from "./User";
import { Products } from "./Products";

@Entity({ name: "product_reviews" })
export class ProductReview {
    @PrimaryGeneratedColumn()
    review_id: number;

    @ManyToOne(() => User, (user) => user.reviews, { onDelete: "CASCADE" })
    user: User;

    @ManyToOne(() => Products, (product) => product.reviews, { onDelete: "CASCADE" })
    product: Products;

    @Column({ type: "int", nullable: false })
    rating: number;

    @Column({ type: "text", nullable: true })
    review_text: string;

    @CreateDateColumn({ type: "timestamp" })
    created_at: Date;

    constructor(review_id: number, user: User, product: Products, rating: number, review_text: string, created_at: Date) {
        this.review_id = review_id;
        this.user = user;
        this.product = product;
        this.rating = rating;
        this.review_text = review_text;
        this.created_at = created_at;
    }
}
