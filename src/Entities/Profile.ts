import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import { User } from "./User";

@Entity()
export class Profile {
    @PrimaryGeneratedColumn()
    profile_id: number;

    @OneToOne(() => User, (user) => user.profile, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })  // Clave foránea en la tabla Profile
    user: User;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true, length: 15 })
    phone: string;

    @Column({ nullable: true, length: 100 })
    nickname: string;

    @Column({ nullable: true })
    avatar: string;

    @Column({ type: "date", nullable: true })
    born_date: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    created_at: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updated_at: Date;


    constructor(profile_id: number, user: User, address: string, phone: string, nickname: string, avatar: string, born_date: Date, created_at: Date, updated_at: Date) {
        this.profile_id = profile_id;
        this.user = user;
        this.address = address;
        this.phone = phone;
        this.nickname = nickname;
        this.avatar = avatar;
        this.born_date = born_date;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}
