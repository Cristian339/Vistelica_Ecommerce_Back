import {
    Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn
} from "typeorm";
import { Order } from "./Order";
import { Products, Size, Color } from "./Products";

@Entity({ schema: 'vistelica' })
export class OrderDetail {
    @PrimaryGeneratedColumn()
    order_detail_id!: number;

    @ManyToOne(() => Order, order => order.details, { onDelete: "CASCADE" })
    @JoinColumn({ name: "order_id" })
    order!: Order;

    @ManyToOne(() => Products, { eager: true })
    @JoinColumn({ name: "product_id" })
    product!: Products;

    @Column("decimal", { precision: 10, scale: 2 })
    price!: number; // precio final aplicado en el momento del pedido

    @Column({ type: "enum", enum: Size, nullable: true })
    size!: Size;

    @Column({ type: "enum", enum: Color, nullable: true })
    color!: Color;

    @Column({ type: "int", default: 1 })
    quantity!: number;
}
