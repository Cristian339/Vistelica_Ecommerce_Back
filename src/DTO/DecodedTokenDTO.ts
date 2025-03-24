// src/DTO/DecodedTokenDTO.ts
export class DecodedTokenDTO {
    id?: number;
    email?: string;
    exp?: number;

    constructor(data: any) {
        this.id = data.id;
        this.email = data.email;
        this.exp = data.exp;
    }

}