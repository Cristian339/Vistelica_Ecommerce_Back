import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Category {
    @PrimaryGeneratedColumn({ type: "int" })
    category_id: number;

    @Column({ length: 100 })
    name: string;

    @Column("text")
    description: string;
}
