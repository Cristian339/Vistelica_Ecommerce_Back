import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn
} from "typeorm";
import { User } from "./User";

@Entity({ schema: 'vistelica' })
export class Order {
    @PrimaryGeneratedColumn({ type: "int" })
    order_id!: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: "order_id" })
    user!: User;

    @Column({ length: 50 })
    status!: string;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}
