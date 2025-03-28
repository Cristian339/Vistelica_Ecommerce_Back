import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany, JoinColumn
} from "typeorm";
import { Subcategory } from "./Subcategory";
import { Category } from "./Category";
import {Review} from "./Review";
import {OrderDetail} from "./OrderDetail";
import {Wishlist} from "./Wishlist";


export enum Size {
    XS = "XS",
    S = "S",
    M = "M",
    L = "L",
    XL = "XL",
    XXL = "XXL"
}

@Entity({ schema: 'vistelica' })
export class Products {
    @PrimaryGeneratedColumn()
    product_id: number;

    @Column({ length: 100 })
    name: string;

    @Column("text")
    description: string;

    @Column("decimal", { precision: 10, scale: 2 })
    price: number;

    @Column("int")
    stock_quantity: number;

    @ManyToOne(() => Category, (category) => category.products, { nullable: true, onDelete: "CASCADE" })
    @JoinColumn({ name: "category_id" })
    category: Category; // Relación obligatoria con Category

    @ManyToOne(() => Subcategory, (subcategory) => subcategory.products, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn({ name: "subcategory_id" })
    subcategory: Subcategory;
    @OneToMany(() => Review, (review) => review.product)
    reviews: Review[];

    @Column({ nullable: true })
    image_url?: string;

    @Column({ type: "enum", enum: Size, nullable: true })
    size: Size;

    @CreateDateColumn()
    created_at: Date;

    @OneToMany(() => OrderDetail, orderDetail => orderDetail.product)
    orderDetails?: OrderDetail[];

    @UpdateDateColumn()
    updated_at: Date;
    @OneToMany(() => Wishlist, (wishlist) => wishlist.product)
    wishlists: Wishlist[];

    @Column("decimal", { precision: 5, scale: 2, nullable: true })
    discount_percentage: number;

    constructor(product_id: number, name: string, description: string, price: number, stock_quantity: number, category: Category, subcategory: Subcategory, reviews: Review[], image_url: string, size: Size, created_at: Date, updated_at: Date, wishlists: Wishlist[], discount_percentage: number) {
        this.product_id = product_id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.stock_quantity = stock_quantity;
        this.category = category;
        this.subcategory = subcategory;
        this.reviews = reviews;
        this.image_url = image_url;
        this.size = size;
        this.created_at = created_at;
        this.updated_at = updated_at;
        this.wishlists = wishlists;
        this.discount_percentage = discount_percentage;
    }
}
