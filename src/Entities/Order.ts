import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn, OneToMany
} from "typeorm";
import { User } from "./User";
import { OrderDetail } from "./OrderDetail";

@Entity({ schema: 'vistelica' })
export class Order {
    @PrimaryGeneratedColumn({ type: "int" })
    order_id!: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: "user_id" })
    user!: User;

    // @ManyToOne(() => User, user => user.orders)
    // user?: User;


    @OneToMany(() => OrderDetail, orderDetail => orderDetail.order, { cascade: true })
    orderDetails?: OrderDetail[];

    @Column({ length: 50 })
    status!: string;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    @Column({ type: "varchar", length: 100, nullable: true })
    session_id?: string | null;
}
