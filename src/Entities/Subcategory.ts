import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, Unique } from "typeorm";
import { Category } from "./Category";
import { Products } from "./Products";

@Entity({ schema: "vistelica" })
@Unique(["name", "category"]) // Permite que "Camisetas" exista en diferentes categorías
export class Subcategory {
    @PrimaryGeneratedColumn({ type: "int" })
    subcategory_id!: number;

    @Column({ length: 100 })
    name!: string;

    @ManyToOne(() => Category, (category) => category.subcategories, { onDelete: "CASCADE", nullable: false })
    @JoinColumn({ name: "category_id" })
    category: Category;

    @OneToMany(() => Products, (product) => product.subcategory)
    products: Products[];

    constructor(subcategory_id: number, name: string, category: Category, products: Products[]) {
        this.subcategory_id = subcategory_id;
        this.name = name;
        this.category = category;
        this.products = products;
    }
}
