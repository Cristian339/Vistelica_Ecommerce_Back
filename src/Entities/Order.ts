import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";
import { OrderDetail } from "./OrderDetail";

@Entity({ schema: 'vistelica' })
export class Order {
    @PrimaryGeneratedColumn({ type: "int" })
    order_id?: number;

    @ManyToOne(() => User, user => user.orders)
    user?: User;

    @OneToMany(() => OrderDetail, orderDetail => orderDetail.order, { cascade: true })
    orderDetails?: OrderDetail[];

    @Column({ type: "varchar", length: 50, nullable: true })
    status?: string;

    @CreateDateColumn({ nullable: true })
    created_at?: Date;

    @UpdateDateColumn({ nullable: true })
    updated_at?: Date;

    @Column({ type: "varchar", length: 100, nullable: true })
    session_id?: string | null;
}