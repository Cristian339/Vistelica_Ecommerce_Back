import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Order {
    @PrimaryGeneratedColumn({ type: "int" })
    order_id: number;

    @ManyToOne(() => User)
    user: User;

    @Column({ length: 50 })
    status: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
