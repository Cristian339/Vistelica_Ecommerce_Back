import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Order } from "./Order";
import { Product } from "./Products";

@Entity()
export class OrderDetail {
    @PrimaryGeneratedColumn({ type: "int" })
    order_detail_id: number;

    @ManyToOne(() => Order)
    order: Order;

    @ManyToOne(() => Product)
    product: Product;

    @Column("int")
    quantity: number;

    @Column("decimal", { precision: 10, scale: 2 })
    price: number;
}