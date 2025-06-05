import { Repository } from 'typeorm';
import { AppDataSource } from "../Config/database";
import { PaymentMethod } from "../Entities/PaymentMethod";
import { User } from "../Entities/User";

export class PaymentMethodService {
    private paymentMethodRepository: Repository<PaymentMethod>;
    private userRepository: Repository<User>;

    constructor() {
        this.paymentMethodRepository = AppDataSource.getRepository(PaymentMethod);
        this.userRepository = AppDataSource.getRepository(User);
    }

    // Crear método de pago
    async createPaymentMethod(data: any, userId: number): Promise<{success: boolean; data?: PaymentMethod; message?: string}> {
        try {
            // Buscar el usuario
            const user = await this.userRepository.findOneBy({ user_id: userId });

            if (!user) {
                return {
                    success: false,
                    message: 'Usuario no encontrado'
                };
            }

            // Validar datos mínimos requeridos
            if (!data.type || !data.provider || !data.card_last_four) {
                return {
                    success: false,
                    message: 'Datos incompletos. Se requieren tipo, proveedor y últimos 4 dígitos.'
                };
            }

            const existingMethods = await this.paymentMethodRepository.count({
                where: { user: { user_id: userId } }
            });

            const newPaymentMethod = this.paymentMethodRepository.create({
                user: user,
                type: data.type,
                provider: data.provider,
                card_last_four: data.card_last_four,
                card_holder_name: data.card_holder_name,
                expiry_month: data.expiry_month,
                expiry_year: data.expiry_year,
                is_default: existingMethods === 0 ? true : data.is_default || false
            });

            // Si este método se marca como predeterminado, quitar ese estado de otros
            if (newPaymentMethod.is_default) {
                await this.resetDefaultPaymentMethod(userId);
            }

            const savedMethod = await this.paymentMethodRepository.save(newPaymentMethod);
            return {
                success: true,
                data: savedMethod,
                message: 'Método de pago agregado correctamente'
            };
        } catch (error: any) {
            console.error("Error:", error);
            return {
                success: false,
                message: `Error al crear método de pago: ${error.message}`
            };
        }
    }

    // Obtener todos los métodos de pago del usuario
    async getUserPaymentMethods(userId: number): Promise<PaymentMethod[]> {
        return this.paymentMethodRepository.find({
            where: { user: { user_id: userId } },
            order: { is_default: "DESC", created_at: "DESC" }
        });
    }

    // Establecer método de pago predeterminado
    async setDefaultPaymentMethod(methodId: number, userId: number): Promise<{success: boolean; data?: PaymentMethod; message?: string}> {
        try {
            // Verificar que existe el método de pago
            const paymentMethod = await this.paymentMethodRepository.findOne({
                where: {
                    payment_method_id: methodId,
                    user: { user_id: userId }
                }
            });

            if (!paymentMethod) {
                return {
                    success: false,
                    message: 'Método de pago no encontrado'
                };
            }

            // Quitar estado predeterminado de todos los métodos
            await this.resetDefaultPaymentMethod(userId);

            // Establecer este método como predeterminado
            paymentMethod.is_default = true;
            const updatedMethod = await this.paymentMethodRepository.save(paymentMethod);

            return {
                success: true,
                data: updatedMethod,
                message: 'Método de pago establecido como predeterminado'
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Error al actualizar método de pago: ${error.message}`
            };
        }
    }

    // Eliminar método de pago
    async deletePaymentMethod(methodId: number, userId: number): Promise<{success: boolean; message?: string}> {
        try {
            const paymentMethod = await this.paymentMethodRepository.findOne({
                where: {
                    payment_method_id: methodId,
                    user: { user_id: userId }
                }
            });

            if (!paymentMethod) {
                return {
                    success: false,
                    message: "Método de pago no encontrado"
                };
            }

            const wasDefault = paymentMethod.is_default;
            await this.paymentMethodRepository.remove(paymentMethod);

            // Si era el predeterminado, establecer otro como predeterminado
            if (wasDefault) {
                const anotherMethod = await this.paymentMethodRepository.findOne({
                    where: { user: { user_id: userId } }
                });

                if (anotherMethod) {
                    anotherMethod.is_default = true;
                    await this.paymentMethodRepository.save(anotherMethod);
                }
            }

            return {
                success: true,
                message: 'Método de pago eliminado correctamente'
            };
        } catch (error: any) {
            return {
                success: false,
                message: `Error al eliminar método de pago: ${error.message}`
            };
        }
    }

    // Quitar estado predeterminado de todos los métodos
    private async resetDefaultPaymentMethod(userId: number): Promise<void> {
        await this.paymentMethodRepository.update(
            { user: { user_id: userId }, is_default: true },
            { is_default: false }
        );
    }

    // Obtener método de pago predeterminado
    async getDefaultPaymentMethod(userId: number): Promise<PaymentMethod | null> {
        return this.paymentMethodRepository.findOne({
            where: {
                user: { user_id: userId },
                is_default: true
            }
        });
    }



    // Dentro de la clase PaymentMethodService

    /**
     * Actualiza un método de pago existente
     * @param methodId ID del método de pago a actualizar
     * @param userId ID del usuario dueño del método de pago
     * @param data Datos a actualizar
     * @returns Resultado de la operación
     */
    async updatePaymentMethod(
        methodId: number,
        userId: number,
        data: Partial<PaymentMethod>
    ): Promise<{success: boolean; data?: PaymentMethod; message?: string}> {
        try {
            // Verificar que existe el método de pago
            const paymentMethod = await this.paymentMethodRepository.findOne({
                where: {
                    payment_method_id: methodId,
                    user: { user_id: userId }
                }
            });

            if (!paymentMethod) {
                return {
                    success: false,
                    message: 'Método de pago no encontrado'
                };
            }

            // Actualizar campos permitidos
            if (data.type !== undefined) paymentMethod.type = data.type;
            if (data.provider !== undefined) paymentMethod.provider = data.provider;
            if (data.card_last_four !== undefined) paymentMethod.card_last_four = data.card_last_four;
            if (data.card_holder_name !== undefined) paymentMethod.card_holder_name = data.card_holder_name;
            if (data.expiry_month !== undefined) paymentMethod.expiry_month = data.expiry_month;
            if (data.expiry_year !== undefined) paymentMethod.expiry_year = data.expiry_year;

            // Manejo especial para is_default
            if (data.is_default !== undefined && data.is_default !== paymentMethod.is_default) {
                if (data.is_default) {
                    // Si se está marcando como predeterminado, quitar ese estado de otros
                    await this.resetDefaultPaymentMethod(userId);
                }
                paymentMethod.is_default = data.is_default;
            }

            // Guardar los cambios
            const updatedMethod = await this.paymentMethodRepository.save(paymentMethod);

            return {
                success: true,
                data: updatedMethod,
                message: 'Método de pago actualizado correctamente'
            };
        } catch (error: any) {
            console.error("Error al actualizar método de pago:", error);
            return {
                success: false,
                message: `Error al actualizar método de pago: ${error.message}`
            };
        }
    }


}