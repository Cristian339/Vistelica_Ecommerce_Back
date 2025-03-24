import {Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany} from "typeorm";
import { Profile } from "./Profile";
import {ProductReview} from "./ProductReview";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    user_id: number;

    @Column({ length: 100 })
    name: string;

    @Column({ unique: true, length: 255, nullable: false })
    email: string;


    @Column({ length: 255 })
    password: string;

    @Column({ type: "enum", enum: ["admin", "vendedor", "cliente"], default: "cliente" })
    role: string;

    @Column({ default: false })
    banned: boolean;

    @Column({ nullable: true, type: "timestamp" })
    banned_at: Date;

    @Column({ nullable: true, type: "text" })
    ban_reason: string;

    // Relación con Profile
    @OneToOne(() => Profile, (profile) => profile.user)
    profile: Profile;
    @OneToMany(() => ProductReview, (review) => review.user)
    reviews: ProductReview[];
    constructor(user_id: number, name: string, email: string, password: string, role: string, banned: boolean, banned_at: Date, ban_reason: string, profile: Profile, reviews: ProductReview[]) {
        this.user_id = user_id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.banned = banned;
        this.banned_at = banned_at;
        this.ban_reason = ban_reason;
        this.profile = profile;
        this.reviews = reviews;
    }
}
