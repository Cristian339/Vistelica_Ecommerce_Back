// En tu archivo OrderDetail.ts
import {
    Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn
} from "typeorm";
import { Order } from "./Order";
import { Products, Size, Color } from "./Products";

export enum RefundStatus {
    NADA = "Nada",
    REVISION = "Revision",
    ACEPTADO = "Aceptado",
    RECHAZADO = "Rechazado"
}

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
    price!: number;

    @Column({ type: "enum", enum: Size, nullable: true })
    size!: Size;

    @Column({ type: "enum", enum: Color, nullable: true })
    color!: Color;

    @Column({ type: "int", default: 1 })
    quantity!: number;

    // Nuevos campos
    @Column({ type: "text", nullable: true })
    motivo_devolucion!: string | null;

    @Column({
        type: "enum",
        enum: RefundStatus,
        enumName: 'order_detail_estado_devolucion_enum',
        default: RefundStatus.NADA
    })
    estado_devolucion!: RefundStatus;
}