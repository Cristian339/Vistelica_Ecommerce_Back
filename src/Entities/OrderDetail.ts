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

    @ManyToOne(() => Products)
    @JoinColumn({ name: "product_id" })
    product!: Products;

    @Column("int")
    quantity!: number;

    @Column("decimal", { precision: 10, scale: 2 })
    price!: number;

    @Column({
        type: "enum",
        enum: ["XS", "S", "M", "L", "XL", "XXL", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40"],
        nullable: true
    })
    size!: string | null;

    @Column({
        type: "enum",
        enum: ["RED", "BLACK", "WHITE", "BLUE", "GREEN", "YELLOW", "ORANGE", "PURPLE", "BROWN", "GRAY", "PINK", "BEIGE", "GOLD", "SILVER", "NAVY"],
        nullable: true
    })
    color!: string | null;
}