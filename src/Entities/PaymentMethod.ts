import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity({ schema: 'vistelica' })
export class PaymentMethod {
    @PrimaryGeneratedColumn()
    payment_method_id!: number;

    @ManyToOne(() => User, user => user.payment_methods)
    @JoinColumn({ name: "user_id" })
    user!: User;

    @Column()
    type!: string; // 'credit_card', 'debit_card', 'paypal', etc.

    @Column()
    provider!: string; // 'visa', 'mastercard', 'paypal', etc.

    @Column({ nullable: true })
    card_last_four?: string;

    @Column({ nullable: true })
    card_holder_name?: string;

    @Column({ nullable: true })
    expiry_month?: number;

    @Column({ nullable: true })
    expiry_year?: number;

    @Column({ default: false })
    is_default!: boolean;

    @CreateDateColumn()
    created_at!: Date;


}