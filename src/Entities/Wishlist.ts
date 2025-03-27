import {Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, JoinColumn} from "typeorm";
import { User } from "./User";
import { Products } from "./Products";

@Entity({ schema: 'vistelica' })
export class Wishlist {
    @PrimaryGeneratedColumn()
    wishlist_id: number;

    @ManyToOne(() => User, (user) => user.wishlists, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user: User;

    @ManyToOne(() => Products, (product) => product.wishlists, { onDelete: "CASCADE" })
    @JoinColumn({ name: "product_id" })
    product: Products;

    @CreateDateColumn()
    created_at: Date;


    constructor(wishlist_id: number, user: User, product: Products, created_at: Date) {
        this.wishlist_id = wishlist_id;
        this.user = user;
        this.product = product;
        this.created_at = created_at;
    }
}
