export class OrderDetailResponseDTO {
    constructor(
        public order_detail_id: number,
        public product_id: number,
        public product_name: string,
        public quantity: number,
        public original_price: number,
        public discount_percentage: number | null,
        public final_price: number,
        public size: string | null,
        public color: string | null,
        public product_image: string | null
    ) {
        this.order_detail_id = order_detail_id;
        this.product_id = product_id;
        this.product_name = product_name;
        this.quantity = quantity;
        this.original_price = original_price;
        this.discount_percentage = discount_percentage;
        this.final_price = final_price;
        this.size = size;
        this.color = color;
        this.product_image = product_image;
    }

}