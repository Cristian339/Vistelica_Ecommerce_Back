import {Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, JoinColumn} from "typeorm";
import { User } from "./User";
import { Products } from "./Products";

@Entity({ schema: 'vistelica' })
export class Wishlist {
    @PrimaryGeneratedColumn()
    wishlist_id: number;

    @ManyToOne(() => User, (user) => user.wishlist, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user: User;

    @ManyToOne(() => Products, (product) => product.wishlists, { onDelete: "CASCADE" })
    product: Products;

    @CreateDateColumn()
    created_at: Date;
}
