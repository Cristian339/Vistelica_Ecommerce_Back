import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Order } from "./Order";

export enum Role {
    ADMIN = "admin",
    VENDEDOR = "vendedor",
    CLIENTE = "cliente"
}

@Entity({ schema: 'vistelica' })
export class User {
    @PrimaryGeneratedColumn({ type: "int" })
    user_id?: number;

    @Column({ length: 100, nullable: true })
    name?: string;

    @Column({ unique: true, nullable: true })
    email?: string;

    @Column({ nullable: true })
    password?: string;

    @Column({ type: "enum", enum: Role, default: Role.CLIENTE })
    role?: Role;

    @Column({ default: false })
    banned?: boolean;

    @Column({ nullable: true, type: "timestamp" })
    banned_at?: Date | null;

    @Column({ nullable: true, type: "text" })
    ban_reason?: string | null;

    // Relación con Order (un usuario puede tener muchos pedidos)
    @OneToMany(() => Order, order => order.user)
    orders?: Order[];
}