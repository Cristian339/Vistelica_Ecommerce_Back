import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn
} from "typeorm";

@Entity({ schema: 'vistelica' })
export class Supplier {
    @PrimaryGeneratedColumn({ type: "int" })
    supplier_id!: number;

    @Column({ length: 100, nullable: false })
    name!: string;

    @Column({ length: 255, unique: true, nullable: false })
    email!: string;

    @Column({ type: "text", nullable: true })
    address?: string;

    @Column({ length: 20, nullable: true })
    phone?: string;

    @Column({ length: 50, nullable: true })
    country?: string;

    @Column({ length: 34, nullable: true, name: "iban" })
    IBAN?: string;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}