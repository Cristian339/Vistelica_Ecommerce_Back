import {Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany, JoinColumn} from "typeorm";
import {Review} from "./Review";
import {Profile} from "./Profile";
import {Order} from "./Order";
import {Wishlist} from "./Wishlist";

export enum Role {
    ADMIN = 0,
    VENDEDOR = 1,
    CLIENTE = 2
}

@Entity({ schema: 'vistelica' })
export class User {
    @PrimaryGeneratedColumn()
    user_id: number;

    @Column({ unique: true, length: 255, nullable: false })
    email: string;

    @Column({ length: 255 })
    password: string;

    @Column({ type: "int", enum: Role, default: Role.CLIENTE })
    role: Role;

    @Column({ default: false })
    banned: boolean;

    @Column({ nullable: true, type: "timestamp" })
    banned_at: Date | null;

    @Column({ nullable: true, type: "text" })
    ban_reason: string | null;

    @OneToOne(() => Profile, (profile) => profile.user)
    profile: Profile;

    @OneToMany(() => Review, (review) => review.user)
    reviews: Review[];

    @OneToMany(() => Wishlist, (wishlist) => wishlist.user)
    wishlists: Wishlist[];

    @OneToMany(() => Order, order => order.user)
    orders?: Order[];


    constructor(user_id: number, email: string, password: string, role: Role, banned: boolean, banned_at: Date | null, ban_reason: string | null, profile: Profile, reviews: Review[], wishlists: Wishlist[], orders: Order[]) {
        this.user_id = user_id;
        this.email = email;
        this.password = password;
        this.role = role;
        this.banned = banned;
        this.banned_at = banned_at;
        this.ban_reason = ban_reason;
        this.profile = profile;
        this.reviews = reviews;
        this.wishlists = wishlists;
        this.orders = orders;
    }
}