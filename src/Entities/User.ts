import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export enum Role {
    ADMIN = 0,
    VENDEDOR = 1,
    CLIENTE = 2
}

@Entity({ schema: 'vistelica' })
export class User {
    @PrimaryGeneratedColumn({ type: "int" })
    user_id!: number;

    @Column({ length: 100 })
    name!: string;

    @Column({ length: 100 })
    lastName!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    password!: string;

    @Column({ type: "enum", enum: Role, default: Role.CLIENTE })
    role!: Role;

    @Column({ default: false })
    banned!: boolean;

    @Column({ nullable: true, type: "timestamp" })
    banned_at?: Date;

    @Column({ nullable: true, type: "text" })
    ban_reason?: string;
}
