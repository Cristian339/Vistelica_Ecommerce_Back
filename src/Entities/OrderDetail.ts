import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Order } from "./Order";
import { Products } from "./Products";

@Entity({ schema: 'vistelica' })
export class OrderDetail {
    @PrimaryGeneratedColumn({ type: "int" })
    order_detail_id?: number;

    @ManyToOne(() => Order, order => order.orderDetails)
    order?: Order;

    @ManyToOne(() => Products)
    product?: Products;

    @Column("int", { nullable: true })
    quantity?: number;

    @Column("decimal", { precision: 10, scale: 2, nullable: true })
    price?: number;
}