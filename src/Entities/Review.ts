import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from "typeorm";
import { User } from "./User";
import { Products } from "./Products";

@Entity({ name: "product_reviews" })
export class Review {
    @PrimaryGeneratedColumn()
    review_id!: number;

    @ManyToOne(() => User, (user) => user.reviews, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @ManyToOne(() => Products, (product) => product.reviews, { onDelete: "CASCADE" })
    @JoinColumn({ name: "product_id" })
    product!: Products;

    @Column({ type: "int", nullable: false })
    rating!: number;

    @Column({ type: "text", nullable: true })
    review_text?: string;

    @CreateDateColumn({ type: "timestamp" })
    created_at!: Date;

    // Constructor opcional
    constructor(
        review_id?: number,
        user?: User,
        product?: Products,
        rating?: number,
        review_text?: string,
        created_at?: Date
    ) {
        if (review_id) this.review_id = review_id;
        if (user) this.user = user;
        if (product) this.product = product;
        if (rating) this.rating = rating;
        if (review_text) this.review_text = review_text;
        if (created_at) this.created_at = created_at || new Date();
    }
}
