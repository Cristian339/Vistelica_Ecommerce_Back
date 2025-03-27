import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn} from "typeorm";
import { Order } from "./Order";
import { Products } from "./Products";

@Entity({ schema: 'vistelica' })
export class OrderDetail {
    @PrimaryGeneratedColumn({ type: "int" })
    order_detail_id!: number;

    @ManyToOne(() => Order)
    @JoinColumn({ name: "order_id" })
    order!: Order;

    // @ManyToOne(() => Order, order => order.orderDetails)
    // order?: Order;

    @ManyToOne(() => Products)
    @JoinColumn({ name: "product_id" })
    product!: Products;

    @Column("int")
    quantity!: number;

    @Column("decimal", { precision: 10, scale: 2 })
    price!: number;
}