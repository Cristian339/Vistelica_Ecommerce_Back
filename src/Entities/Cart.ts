import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    OneToMany,
    OneToOne
} from "typeorm";
import { User } from "./User";
import { CartDetail } from "./CartDetail";
import { Payment } from "./Payment";

@Entity({ schema: 'vistelica' })
export class Cart {
    @PrimaryGeneratedColumn({ type: "int" })
    cart_id!: number;

    @ManyToOne(() => User, {
        cascade: true,
        onDelete: "CASCADE" // Añade esto también
    })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @OneToMany(() => CartDetail, cartDetail => cartDetail.cart, {
        cascade: true,
        onDelete: "CASCADE" // Añade esto también
    })
    cartDetails?: CartDetail[];

    @Column({ length: 50 })
    status!: string;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @Column({ type: "text", nullable: true })
    address?: string;

    @Column({ type: "varchar", length: 100, nullable: true })
    session_id?: string | null;
}