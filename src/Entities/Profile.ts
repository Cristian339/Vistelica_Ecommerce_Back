import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity({ schema: "vistelica" })
export class Profile {
    @PrimaryGeneratedColumn()
    profile_id!: number;

    @OneToOne(() => User, (user) => user.profile, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: User;

    @Column({ length: 100 })
    name!: string;

    @Column({ length: 100 })
    lastName!: string;

    @Column({ unique: true, length: 255, nullable: false })
    email!: string;

    @Column({ nullable: true })
    address!: string;

    @Column({ nullable: true, length: 15 })
    phone!: string;

    @Column({ nullable: true })
    avatar!: string;

    @Column({ type: "date", nullable: true })
    born_date!: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    created_at!: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updated_at!: Date;


}