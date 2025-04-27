import { Products } from "../Entities/Products";

export class ProductImageDto {
    image_id: number;
    image_url: string;
    is_main: boolean;
    product_id: number;

    constructor(image: any) {
        this.image_id = image.image_id;
        this.image_url = image.image_url;
        this.is_main = image.is_main;
        this.product_id = image.product.product_id;
    }
}