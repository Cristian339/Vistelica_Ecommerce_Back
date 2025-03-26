import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany
} from "typeorm";
// Importa Subcategory desde Category.ts
import { Subcategory } from "./Subcategory";
import {OrderDetail} from "./OrderDetail";

export enum Size {
    XS = "XS",
    S = "S",
    M = "M",
    L = "L",
    XL = "XL",
    XXL = "XXL"
}

@Entity({ schema: 'vistelica' })
export class Products {

    @PrimaryGeneratedColumn({ type: "int" })
    product_id: number;

    @Column({ length: 100 })
    name: string;

    @Column("text")
    description: string;

    @Column("decimal", { precision: 10, scale: 2 })
    price: number;

    @Column("int")
    stock_quantity: number;

    @ManyToOne(() => Subcategory, (subcategory) => subcategory.products, { onDelete: "CASCADE" })
    subcategory: Subcategory; // Relación ManyToOne con Subcategory

    @Column({ nullable: true })
    image_url: string;

    @Column({ type: "enum", enum: Size, nullable: true })
    size: Size;

    @CreateDateColumn()
    created_at: Date;

    @OneToMany(() => OrderDetail, orderDetail => orderDetail.product)
    orderDetails?: OrderDetail[];

    @UpdateDateColumn()
    updated_at: Date;
    constructor(product_id: number, name: string, description: string, price: number, stock_quantity: number, subcategory: Subcategory, image_url: string, size: Size, created_at: Date, updated_at: Date) {
        this.product_id = product_id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.stock_quantity = stock_quantity;
        this.subcategory = subcategory;
        this.image_url = image_url;
        this.size = size;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}
