import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Category } from "./Category";

@Entity()
export class Subcategory {
    @PrimaryGeneratedColumn({ type: "int" })
    subcategory_id: number;

    @Column({ unique: true, length: 100 })
    name: string;

    @ManyToOne(() => Category, { onDelete: "CASCADE" })
    category: Category;
}