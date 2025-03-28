import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity({ schema: 'vistelica' })
export class Notification {
    @PrimaryGeneratedColumn()
    notification_id!: number;

    @ManyToOne(() => User, user => user.notifications, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' }) // Esto es crucial
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