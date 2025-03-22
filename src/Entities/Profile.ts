import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Profile {
    @PrimaryGeneratedColumn({ type: "int" })
    profile_id: number;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    user: User;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    phone: string;

    @Column({ nullable: true })
    nickname: string;

    @Column({ nullable: true })
    avatar: string;

    @Column({ nullable: true, type: "date" })
    born_date: Date;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}