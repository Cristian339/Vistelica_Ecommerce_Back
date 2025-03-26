import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { Order } from "./Order";

@Entity()
export class Payment {
    @PrimaryGeneratedColumn({ type: "int" })
    payment_id: number | undefined;

    @ManyToOne(() => Order)
    order: Order | undefined;

    @Column({ length: 50 })
    payment_method: string | undefined;

    @Column({ length: 50 })
    payment_status: string | undefined;

    @CreateDateColumn()
    payment_date: Date | undefined;

    @Column("decimal", { precision: 10, scale: 2 })
    amount: number | undefined;
}
