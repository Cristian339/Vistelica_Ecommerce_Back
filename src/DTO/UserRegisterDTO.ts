import { Role } from "../Entities/User";

export class UserRegisterDTO {
    name: string;
    lastName: string;
    email: string;
    password: string;
    role?: Role;
    address?: string;
    phone?: string;
    avatar?: string;
    born_date?: Date;

    constructor(data: any) {
        this.name = data.name;
        this.lastName = data.lastName;
        this.email = data.email;
        this.password = data.password;
        this.role = data.role !== undefined ? Number(data.role) as Role : undefined;
        this.address = data.address;
        this.phone = data.phone;
        this.avatar = data.avatar;
        this.born_date = data.born_date ? new Date(data.born_date) : undefined;
    }

    validate(): string[] {
        const errors: string[] = [];

        if (!this.name || this.name.trim() === '')
            errors.push("El nombre es obligatorio");

        if (!this.lastName || this.lastName.trim() === '')
            errors.push("El apellido es obligatorio");

        if (!this.email || !this.validateEmail(this.email))
            errors.push("Email inválido");

        if (!this.password || this.password.length < 6)
            errors.push("La contraseña debe tener al menos 6 caracteres");

        return errors;
    }

    private validateEmail(email: string): boolean {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
}