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
import {ProductImage} from "./ProductImage";




export enum Color {
    RED = "RED",
    BLACK = "BLACK",
    WHITE = "WHITE",
    BLUE = "BLUE",
    GREEN = "GREEN",
    YELLOW = "YELLOW",
    ORANGE = "ORANGE",
    PURPLE = "PURPLE",
    BROWN = "BROWN",
    GRAY = "GRAY",
    PINK = "PINK",
    BEIGE = "BEIGE",
    GOLD = "GOLD",
    SILVER = "SILVER",
    NAVY = "NAVY",
}
export enum Size {
    XS = "XS",
    S = "S",
    M = "M",
    L = "L",
    XL = "XL",
    XXL = "XXL",
    Size_31 = "31",
    Size_32 = "32",
    Size_33 = "33",
    Size_34 = "34",
    Size_35 = "35",
    Size_36 = "36",
    Size_37 = "37",
    Size_38 = "38",
    Size_39 = "39",
    Size_40 = "40"
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
    category: Category;

    @ManyToOne(() => Subcategory, (subcategory) => subcategory.products, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn({ name: "subcategory_id" })
    subcategory: Subcategory;
    @OneToMany(() => Review, (review) => review.product)
    reviews: Review[];


    @OneToMany(() => ProductImage, (image) => image.product)
    images: ProductImage[];


    @Column({ type: "enum", enum: Size, array: true, nullable: true })
    sizes: Size[];

    @Column({ type: "enum", enum: Color, array: true, nullable: true })
    colors: Color[];
    @Column({type: "boolean", default: false})
    discard!: boolean;

    @CreateDateColumn()
    created_at: Date;

    @OneToMany(() => OrderDetail, orderDetail => orderDetail.product)
    orderDetails?: OrderDetail[];

    @UpdateDateColumn()
    updated_at: Date;
    @OneToMany(() => Wishlist, (wishlist) => wishlist.product)
    wishlists: Wishlist[];


    @Column('decimal', { precision: 5, scale: 2, nullable: true })
    discount_percentage: number | null;


    constructor(product_id: number, name: string, description: string, price: number, stock_quantity: number, category: Category, subcategory: Subcategory, reviews: Review[], images: ProductImage[], sizes: Size[], colors: Color[], discard: boolean, created_at: Date, orderDetails: OrderDetail[], updated_at: Date, wishlists: Wishlist[], discount_percentage: number | null) {
        this.product_id = product_id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.stock_quantity = stock_quantity;
        this.category = category;
        this.subcategory = subcategory;
        this.reviews = reviews;
        this.images = images;
        this.sizes = sizes;
        this.colors = colors;
        this.discard = discard;
        this.created_at = created_at;
        this.orderDetails = orderDetails;
        this.updated_at = updated_at;
        this.wishlists = wishlists;
        this.discount_percentage = discount_percentage;
    }
}
