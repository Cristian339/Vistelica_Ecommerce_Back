import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Profile {
    @PrimaryGeneratedColumn({ type: "int" })
    profile_id: number | undefined;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    user: User | undefined;

    @Column({ nullable: true })
    address: string | undefined;

    @Column({ nullable: true })
    phone: string | undefined;

    @Column({ nullable: true })
    nickname: string | undefined;

    @Column({ nullable: true })
    avatar: string | undefined;

    @Column({ nullable: true, type: "date" })
    born_date: Date | undefined;

    @CreateDateColumn()
    created_at: Date | undefined;

    @UpdateDateColumn()
    updated_at: Date | undefined;
}