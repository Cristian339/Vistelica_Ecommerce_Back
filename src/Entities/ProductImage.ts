import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn
} from "typeorm";
import { Products } from "./Products";

@Entity({ schema: 'vistelica' })
export class ProductImage {
    @PrimaryGeneratedColumn()
    image_id: number;

    @Column()
    image_url: string;

    @Column({ default: false })
    is_main: boolean;

    @ManyToOne(() => Products, (product) => product.images, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'product_id' })
    product: Products;


    constructor(image_id: number, image_url: string, is_main: boolean, product: Products) {
        this.image_id = image_id;
        this.image_url = image_url;
        this.is_main = is_main;
        this.product = product;
    }
}
