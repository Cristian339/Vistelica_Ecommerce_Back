
import { AppDataSource } from "../Config/database";
import { PaymentMethod } from "../Entities/PaymentMethod";
import { User } from "../Entities/User";
import { verify } from "jsonwebtoken";

export class PaymentMethodService {
    private paymentMethodRepository = AppDataSource.getRepository(PaymentMethod);
    private userRepository = AppDataSource.getRepository(User);

    async createPaymentMethod(data: any, token: string): Promise<PaymentMethod> {
        const decoded: any = verify(token.split(" ")[1], process.env.JWT_SECRET || 'secret');
        const user = await this.userRepository.findOneBy({ user_id: decoded.id });

        if (!user) {
            throw new Error("Usuario no encontrado");
        }

        // Si es el primer método de pago, establecerlo como predeterminado
        const existingMethods = await this.paymentMethodRepository.count({
            where: { user: { user_id: user.user_id } }
        });

        // Crear un nuevo objeto PaymentMethod directamente
        const newPaymentMethod = new PaymentMethod();
        newPaymentMethod.user = user;
        newPaymentMethod.type = data.type;
        newPaymentMethod.provider = data.provider;
        newPaymentMethod.card_last_four = data.card_last_four;
        newPaymentMethod.card_holder_name = data.card_holder_name;
        newPaymentMethod.expiry_month = data.expiry_month;
        newPaymentMethod.expiry_year = data.expiry_year;
        newPaymentMethod.is_default = existingMethods === 0 ? true : data.is_default || false;

        // Si este método es predeterminado, actualizar los otros métodos
        if (newPaymentMethod.is_default) {
            await this.paymentMethodRepository.update(
                { user: { user_id: user.user_id }, is_default: true },
                { is_default: false }
            );
        }

        // Guardar la entidad
        return await this.paymentMethodRepository.save(newPaymentMethod);
    }

    async getUserPaymentMethods(token: string): Promise<PaymentMethod[]> {
        const decoded: any = verify(token.split(" ")[1], process.env.JWT_SECRET || 'secret');

        return this.paymentMethodRepository.find({
            where: { user: { user_id: decoded.id } },
            order: { is_default: "DESC", created_at: "DESC" }
        });
    }

    async setDefaultPaymentMethod(methodId: number, token: string): Promise<PaymentMethod> {
        const decoded: any = verify(token.split(" ")[1], process.env.JWT_SECRET || 'secret');

        // Verificar que el método pertenece al usuario
        const paymentMethod = await this.paymentMethodRepository.findOne({
            where: {
                payment_method_id: methodId,
                user: { user_id: decoded.id }
            }
        });

        if (!paymentMethod) {
            throw new Error("Método de pago no encontrado");
        }

        // Quitar el estado predeterminado a todos los métodos del usuario
        await this.paymentMethodRepository.update(
            { user: { user_id: decoded.id } },
            { is_default: false }
        );

        // Establecer este método como predeterminado
        paymentMethod.is_default = true;
        return this.paymentMethodRepository.save(paymentMethod);
    }

    async deletePaymentMethod(methodId: number, token: string): Promise<void> {
        const decoded: any = verify(token.split(" ")[1], process.env.JWT_SECRET || 'secret');

        const paymentMethod = await this.paymentMethodRepository.findOne({
            where: {
                payment_method_id: methodId,
                user: { user_id: decoded.id }
            }
        });

        if (!paymentMethod) {
            throw new Error("Método de pago no encontrado");
        }

        await this.paymentMethodRepository.remove(paymentMethod);

        // Si se elimina un método predeterminado, establecer otro como predeterminado
        if (paymentMethod.is_default) {
            const anotherMethod = await this.paymentMethodRepository.findOne({
                where: { user: { user_id: decoded.id } }
            });

            if (anotherMethod) {
                anotherMethod.is_default = true;
                await this.paymentMethodRepository.save(anotherMethod);
            }
        }
    }
}