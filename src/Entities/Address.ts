// src/Entities/Address.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User";

@Entity("additional_address", { schema: "vistelica" })
export class AdditionalAddress {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    street: string;

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

    @ManyToOne(() => User, user => user.additional_addresses)
    @JoinColumn({ name: "user_id" })
    user: User;

    @Column()
    user_id: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    constructor(
        id: number = 0,
        street: string = '',
        city: string = '',
        state: string = '',
        postal_code: string = '',
        country: string | null = null,
        is_default: boolean = false,
        label: string | null = null,
        user: User | null = null,
        user_id: number = 0
    ) {
        this.id = id;
        this.street = street;
        this.city = city;
        this.state = state;
        this.postal_code = postal_code;
        this.country = country || '';
        this.is_default = is_default;
        this.label = label || '';
        this.user = user as User;
        this.user_id = user_id;
        this.created_at = new Date();
        this.updated_at = new Date();
    }
}