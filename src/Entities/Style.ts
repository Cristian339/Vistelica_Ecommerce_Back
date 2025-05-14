import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn
} from 'typeorm';
import { Category } from './Category';
import { StyleImage } from './StyleImage';
import { Products } from './Products';

@Entity({ schema: 'vistelica' })
export class Style {
    @PrimaryGeneratedColumn()
    style_id: number;

    @Column()
    name: string;

    @Column({ type: 'text' })
    description: string;

    @OneToMany(() => StyleImage, (styleImage) => styleImage.style, {
        cascade: true,
    })
    styleImages: StyleImage[];

    @OneToMany(() => Products, (product) => product.style)
    products: Products[];

    @ManyToOne(() => Category, (category) => category.styles)
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    constructor(style_id: number, name: string, description: string, styleImages: StyleImage[], products: Products[], category: Category, created_at: Date, updated_at: Date) {
        this.style_id = style_id;
        this.name = name;
        this.description = description;
        this.styleImages = styleImages;
        this.products = products;
        this.category = category;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }
}
