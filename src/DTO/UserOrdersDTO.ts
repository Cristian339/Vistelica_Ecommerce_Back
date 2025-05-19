import {OrderResponseDTO} from "./OrderResponseDTO";

export class UserOrdersDTO {
    constructor(
        public orders: OrderResponseDTO[]
    ) {}
}
