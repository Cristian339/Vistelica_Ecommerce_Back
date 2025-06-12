import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from "typeorm";
import { Order } from "./Order";

@Entity({ schema: 'vistelica' })
export class Payment {
    @PrimaryGeneratedColumn({ type: "int" })
    payment_id!: number;

    @ManyToOne(() => Order, order => order.payments, { nullable: false, onDelete: "CASCADE" })
    @JoinColumn({ name: "order_id" })
    order!: Order;

    @Column({ length: 50 })
    payment_method!: string;

    @Column({ length: 50 })
    payment_status!: string;

    @CreateDateColumn()
    payment_date!: Date;

    @Column("decimal", { precision: 10, scale: 2 })
    amount!: number;
}
