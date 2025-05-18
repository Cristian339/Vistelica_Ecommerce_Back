import {AdditionalAddress} from "../Entities/Address";

export class UserProfileDTO {
    name: string;
    lastName: string;
    addresses: AdditionalAddress[];

    constructor(name: string, lastName: string, addresses: AdditionalAddress[]) {
        this.name = name;
        this.lastName = lastName;
        this.addresses = addresses;
    }
}