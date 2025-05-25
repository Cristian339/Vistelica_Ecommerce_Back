import {
    Entity, PrimaryGeneratedColumn, Column, ManyToOne,
    OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn
} from "typeorm";
import { User } from "./User";
import { OrderDetail } from "./OrderDetail";
import { Payment } from "./Payment";
import { AdditionalAddress } from "./Address";

export enum OrderStatus {
    ALMACEN = "Almacen",
    PENDIENTE = "Pendiente",
    ENVIADO = "Enviado",
    ENTREGADO = "Entregado",
    CANCELADO = "Cancelado"
}

@Entity({ schema: 'vistelica' })
export class Order {
    @PrimaryGeneratedColumn()
    order_id!: number;

    @Column({ unique: true })
    order_number!: string;

    @ManyToOne(() => User, user => user.orders, { eager: true })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @ManyToOne(() => AdditionalAddress, { eager: true })
    @JoinColumn({ name: 'address_id' })
    address!: AdditionalAddress;

    @Column({ nullable: true })
    payment_method_id!: number;

    @Column({ nullable: true })
    payment_method_name!: string;

    @Column({ type: "enum", enum: OrderStatus, default: OrderStatus.ALMACEN })
    status!: OrderStatus;

    @Column("decimal", { precision: 10, scale: 2 })
    total_price!: number;

    @Column("decimal", { precision: 5, scale: 2, default: 0 })
    shipping_cost!: number;

    @Column({ type: 'timestamp', nullable: true })
    estimated_delivery_date!: Date;

    @Column({ type: 'timestamp', nullable: true })
    delivered_at!: Date;

    @OneToMany(() => OrderDetail, detail => detail.order, { cascade: true, eager: true })
    details!: OrderDetail[];

    @OneToMany(() => Payment, (payment) => payment.order, { cascade: true })
    payments!: Payment[];

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;



    calculateShippingCost() {
        this.shipping_cost = this.total_price > 50 ? 0 : 5;
    }
}
