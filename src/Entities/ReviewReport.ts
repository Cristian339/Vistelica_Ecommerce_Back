import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from "typeorm";
import { Review } from "./Review";
import { User } from "./User";

export enum ReportReason {
    IRRELEVANT = "No tiene que ver con el tema",
    INAPPROPRIATE = "Inapropiada",
    FALSE = "Falsa",
    OTHER = "Otro"
}

@Entity({ name: "review_reports", schema: 'vistelica' })
export class ReviewReport {
    @PrimaryGeneratedColumn()
    report_id: number;

    @ManyToOne(() => User, { onDelete: "SET NULL" })
    @JoinColumn({ name: "user_id" })
    user: User;

    @ManyToOne(() => Review, { onDelete: "CASCADE" })
    @JoinColumn({ name: "review_id" })
    review: Review;

    @Column({ type: "enum", enum: ReportReason })
    reason: ReportReason;

    @Column({ type: "text", nullable: true })
    other_reason_text?: string;

    @CreateDateColumn({ type: "timestamp" })
    reported_at: Date;

    constructor(
        report_id: number,
        user: User,
        review: Review,
        reason: ReportReason,
        other_reason_text?: string,
        reported_at: Date = new Date()
    ) {
        this.report_id = report_id;
        this.user = user;
        this.review = review;
        this.reason = reason;
        this.other_reason_text = other_reason_text;
        this.reported_at = reported_at;
    }
}
