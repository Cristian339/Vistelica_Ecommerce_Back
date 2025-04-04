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
import { OrderDetail } from "./OrderDetail";
import { Payment } from "./Payment";

@Entity({ schema: 'vistelica' })
export class Order {
    @PrimaryGeneratedColumn({ type: "int" })
    order_id!: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: "user_id" })
    user!: User;

    @OneToMany(() => OrderDetail, orderDetail => orderDetail.order, { cascade: true })
    orderDetails?: OrderDetail[];

    @OneToOne(() => Payment, payment => payment.order, {cascade: true, nullable: true})
    payment?: Payment | null;

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