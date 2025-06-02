import { Role } from "../Entities/User";

export class UserRegisterDTO {
    // Campos básicos del usuario
    name: string;
    lastName: string;
    email: string;
    password: string;
    role?: Role;
    phone?: string;
    avatar?: string;
    born_date?: Date;

    // Dirección principal
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    block?: string;
    floor?: string;
    door?: string;
    label?: string;
    is_default?: boolean;

    // Dirección adicional
    includeAdditionalAddress?: boolean;
    additional_street?: string;
    additional_city?: string;
    additional_state?: string;
    additional_postal_code?: string;
    additional_country?: string;
    additional_block?: string;
    additional_floor?: string;
    additional_door?: string;
    additional_label?: string;
    additional_is_default?: boolean;

    constructor(data: any) {
        // Campos básicos
        this.name = data.name;
        this.lastName = data.lastName;
        this.email = data.email;
        this.password = data.password;
        this.role = data.role !== undefined ? Number(data.role) as Role : undefined;
        this.phone = data.phone;
        this.avatar = data.avatar;
        this.born_date = data.born_date ? new Date(data.born_date) : undefined;

        // Dirección principal
        this.street = data.street;
        this.city = data.city;
        this.state = data.state;
        this.postal_code = data.postal_code;
        this.country = data.country;
        this.block = data.block;
        this.floor = data.floor;
        this.door = data.door;
        this.label = data.label;
        this.is_default = data.is_default;

        // Dirección adicional
        this.includeAdditionalAddress = data.includeAdditionalAddress;
        this.additional_street = data.additional_street;
        this.additional_city = data.additional_city;
        this.additional_state = data.additional_state;
        this.additional_postal_code = data.additional_postal_code;
        this.additional_country = data.additional_country;
        this.additional_block = data.additional_block;
        this.additional_floor = data.additional_floor;
        this.additional_door = data.additional_door;
        this.additional_label = data.additional_label;
        this.additional_is_default = data.additional_is_default;
    }

    validate(): string[] {
        const errors: string[] = [];

        // Validaciones campos básicos
        if (!this.name || this.name.trim() === '')
            errors.push("El nombre es obligatorio");

        if (!this.lastName || this.lastName.trim() === '')
            errors.push("El apellido es obligatorio");

        if (!this.email || !this.validateEmail(this.email))
            errors.push("Email inválido");

        if (!this.password || this.password.length < 6)
            errors.push("La contraseña debe tener al menos 6 caracteres");

        // Validación teléfono
        if (this.phone) {
            const digitsOnly = this.phone.replace(/\D/g, '');
            if (digitsOnly.length < 6 || digitsOnly.length > 15) {
                errors.push('El número de teléfono debe tener entre 6 y 15 dígitos');
            }
        }

        // Validaciones dirección principal (si se proporciona)
        if (this.street || this.city || this.state || this.postal_code || this.country) {
            if (!this.street || this.street.trim() === '')
                errors.push("La calle de la dirección principal es obligatoria");

            if (!this.city || this.city.trim() === '')
                errors.push("La ciudad de la dirección principal es obligatoria");

            if (!this.state || this.state.trim() === '')
                errors.push("El estado/provincia de la dirección principal es obligatorio");

            if (!this.postal_code || this.postal_code.trim() === '')
                errors.push("El código postal de la dirección principal es obligatorio");

            if (!this.country || this.country.trim() === '')
                errors.push("El país de la dirección principal es obligatorio");
        }

        // Validaciones dirección adicional (solo si está marcada como incluida)
        if (this.includeAdditionalAddress) {
            if (!this.additional_street || this.additional_street.trim() === '')
                errors.push("La calle de la dirección adicional es obligatoria");

            if (!this.additional_city || this.additional_city.trim() === '')
                errors.push("La ciudad de la dirección adicional es obligatoria");

            if (!this.additional_state || this.additional_state.trim() === '')
                errors.push("El estado/provincia de la dirección adicional es obligatorio");

            if (!this.additional_postal_code || this.additional_postal_code.trim() === '')
                errors.push("El código postal de la dirección adicional es obligatorio");

            if (!this.additional_country || this.additional_country.trim() === '')
                errors.push("El país de la dirección adicional es obligatorio");
        }

        // Validación de códigos postales (formato básico)
        if (this.postal_code && !this.validatePostalCode(this.postal_code)) {
            errors.push("El código postal principal tiene un formato inválido");
        }

        if (this.additional_postal_code && !this.validatePostalCode(this.additional_postal_code)) {
            errors.push("El código postal adicional tiene un formato inválido");
        }

        return errors;
    }

    private validateEmail(email: string): boolean {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    private validatePostalCode(postalCode: string): boolean {
        // Validación básica: solo números y letras, longitud entre 3 y 10 caracteres
        const regex = /^[A-Za-z0-9\s-]{3,10}$/;
        return regex.test(postalCode.trim());
    }

    // Método helper para obtener solo los datos de dirección principal
    getMainAddressData() {
        return {
            street: this.street,
            city: this.city,
            state: this.state,
            postal_code: this.postal_code,
            country: this.country,
            block: this.block,
            floor: this.floor,
            door: this.door,
            label: this.label,
            is_default: this.is_default
        };
    }

    // Método helper para obtener solo los datos de dirección adicional
    getAdditionalAddressData() {
        if (!this.includeAdditionalAddress) return null;

        return {
            street: this.additional_street,
            city: this.additional_city,
            state: this.additional_state,
            postal_code: this.additional_postal_code,
            country: this.additional_country,
            block: this.additional_block,
            floor: this.additional_floor,
            door: this.additional_door,
            label: this.additional_label,
            is_default: this.additional_is_default
        };
    }

    // Método helper para obtener datos del usuario sin las direcciones
    getUserBasicData() {
        return {
            name: this.name,
            lastName: this.lastName,
            email: this.email,
            password: this.password,
            role: this.role,
            phone: this.phone,
            avatar: this.avatar,
            born_date: this.born_date
        };
    }
}