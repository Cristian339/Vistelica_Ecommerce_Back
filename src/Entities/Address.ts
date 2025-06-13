// src/Entities/Address.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

@Entity("additional_address", { schema: "vistelica" })
export class AdditionalAddress {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    street: string;

    @Column({ nullable: true })
    numero: string;

    @Column()
    city: string;

    @Column()
    state: string;

    @Column()
    postal_code: string;

    @Column({ nullable: true })
    country: string;

    @Column({ default: false })
    is_default: boolean;

    @Column({ nullable: true })
    label: string;

    @Column({ nullable: true })
    block!: string;

    @Column({ nullable: true })
    floor!: string;

    @Column({ nullable: true })
    door!: string;

    @Column({ nullable: true, type: 'text' })
    description: string; // Nuevo campo descripción

    @ManyToOne(() => User, user => user.additional_addresses, { nullable: true })
    @JoinColumn({ name: "user_id" })
    user: User | null;

    @Column({ nullable: true })
    user_id: number | null;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    constructor(
        id: number = 0,
        street: string = '',
        numero: string | null = null,
        city: string = '',
        state: string = '',
        postal_code: string = '',
        country: string | null = null,
        is_default: boolean = false,
        label: string | null = null,
        description: string | null = null, // Nuevo parámetro
        user: User | null = null,
        user_id: number = 0
    ) {
        this.id = id;
        this.street = street;
        this.numero = numero || '';
        this.city = city;
        this.state = state;
        this.postal_code = postal_code;
        this.country = country || '';
        this.is_default = is_default;
        this.label = label || '';
        this.description = description || '';
        this.user = user as User;
        this.user_id = user_id;
        this.created_at = new Date();
        this.updated_at = new Date();
    }
}