import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Subcategory } from "./Subcategory";

export enum Size {
    XS = "XS",
    S = "S",
    M = "M",
    L = "L",
    XL = "XL",
    XXL = "XXL"
}

@Entity()
export class Product {
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

    @ManyToOne(() => Subcategory, { onDelete: "CASCADE" })
    subcategory: Subcategory;

    @Column({ nullable: true })
    image_url: string;

    @Column({ type: "enum", enum: Size, nullable: true })
    size: Size;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
