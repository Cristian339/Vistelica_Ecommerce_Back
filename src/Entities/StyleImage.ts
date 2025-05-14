import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { Style } from './Style';

@Entity({ schema: 'vistelica' })
export class StyleImage {
    @PrimaryGeneratedColumn()
    image_id: number;

    @Column()
    image_url: string;

    @Column({ default: false })
    is_main: boolean;

    @ManyToOne(() => Style, (style) => style.styleImages, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'style_id' })
    style: Style;

    constructor(image_id: number, image_url: string, is_main: boolean, style: Style) {
        this.image_id = image_id;
        this.image_url = image_url;
        this.is_main = is_main;
        this.style = style;
    }
}
