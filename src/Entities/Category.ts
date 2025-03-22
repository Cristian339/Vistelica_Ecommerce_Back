import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import {Subcategory} from "./Subcategory";
// Importa la entidad Subcategory

@Entity({ schema: 'vistelica' })
export class Category {
    @PrimaryGeneratedColumn({ type: "int" })
    category_id: number;

    @Column({ unique: true, length: 100 })
    name: string;

    @OneToMany(() => Subcategory, (subcategory) => subcategory.category, { cascade: true })
    subcategories: Subcategory[];
    constructor(category_id: number, name: string, subcategories: Subcategory[]) {
        this.category_id = category_id;
        this.name = name;
        this.subcategories = subcategories;
    }
}

