import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { Category } from "./Category";  // Importa la entidad Category
import { Product } from "./Product";   // Importa la entidad Product

@Entity()
export class Subcategory {
    @PrimaryGeneratedColumn({ type: "int" })
    subcategory_id: number;

    @Column({ unique: true, length: 100 })
    name: string;

    @ManyToOne(() => Category, (category) => category.subcategories, { onDelete: "CASCADE" })
    category: Category;

    @OneToMany(() => Product, (product) => product.subcategory)
    products: Product[];
    constructor(subcategory_id: number, name: string, category: Category, products: Product[]) {
        this.subcategory_id = subcategory_id;
        this.name = name;
        this.category = category;
        this.products = products;
    }
}
