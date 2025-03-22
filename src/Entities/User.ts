import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

export enum Role {
    ADMIN = "admin",
    VENDEDOR = "vendedor",
    CLIENTE = "cliente"
}

@Entity()
export class User {
    @PrimaryGeneratedColumn({ type: "int" })
    user_id!: number;

    @Column({ length: 100 })
    name!: string;

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
