import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

@Entity({ schema: 'vistelica' })
export class Notification {
    @PrimaryGeneratedColumn()
    notification_id!: number;

    @ManyToOne(() => User, user => user.user_id, { onDelete: 'CASCADE' })
    user!: User;

    @Column({ type: 'text' })
    message!: string;

    @Column({ length: 20, default: 'unread' })
    status!: string;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;
}