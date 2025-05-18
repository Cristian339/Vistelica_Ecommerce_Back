import {OrderDetailResponseDTO} from "./OrderDetailResponseDTO";

export class OrderResponseDTO {
    constructor(
        public order_id: number,
        public status: string,
        public created_at: Date,
        public updated_at: Date,
        public address: string | null,
        public orderDetails: OrderDetailResponseDTO[]
    ) {}
}