import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Subcategory } from "./Subcategory";
import { Products } from "./Products";

@Entity({ schema: "vistelica" })
export class Category {
    @PrimaryGeneratedColumn({ type: "int" })
    category_id: number;

    @Column({ unique: true, length: 100 })
    name: string;

    @OneToMany(() => Subcategory, (subcategory) => subcategory.category, { cascade: true })
    subcategories: Subcategory[];

    @OneToMany(() => Products, (product) => product.category)
    products: Products[];

    constructor(category_id: number, name: string, subcategories: Subcategory[], products: Products[]) {
        this.category_id = category_id;
        this.name = name;
        this.subcategories = subcategories;
        this.products = products;
    }
}
