import { Repository } from 'typeorm';
import { AdditionalAddress } from '../Entities/Address';
import { AppDataSource } from '../Config/database';
import {Order} from "../Entities/Order";

export class AddressService {
    private addressRepository: Repository<AdditionalAddress>;
    private orderRepository: Repository<Order>;

    constructor() {
        this.addressRepository = AppDataSource.getRepository(AdditionalAddress);
        this.orderRepository = AppDataSource.getRepository(Order);
    }

    // Obtener todas las direcciones adicionales del usuario
    async getAddresses(userId: number): Promise<AdditionalAddress[]> {
        return this.addressRepository.find({
            where: { user_id: userId },
            order: { is_default: 'DESC', created_at: 'ASC' }
        });
    }

    // Agregar nueva dirección adicional
    async addAddress(addressData: Partial<AdditionalAddress>, userId: number): Promise<{success: boolean; data?: AdditionalAddress; message?: string}> {
        // Validar que la dirección no esté vacía

        if (!addressData.street || !addressData.city || !addressData.postal_code) {
            return {
                success: false,
                message: 'Datos incompletos. Se requiere calle, ciudad y código postal.'
            };
        }

        // Verificar si ya existe una dirección similar
        const isDuplicate = await this.isDuplicateAddress(addressData, userId);
        if (isDuplicate) {
            return {
                success: false,
                message: 'Ya tienes una dirección igual o muy similar registrada.'
            };
        }

        const address = this.addressRepository.create({
            ...addressData,
            user_id: userId
        });

        // Si esta dirección se marca como predeterminada, quitar ese estado de otras
        if (address.is_default) {
            await this.resetDefaultAddress(userId);
        }

        const savedAddress = await this.addressRepository.save(address);
        return {
            success: true,
            data: savedAddress,
            message: 'Dirección agregada correctamente'
        };
    }

    // Actualizar dirección
    async updateAddress(id: number, addressData: Partial<AdditionalAddress>, userId: number): Promise<{success: boolean; data?: AdditionalAddress; message?: string}> {
        // Verificar que existe la dirección
        const existingAddress = await this.addressRepository.findOne({ where: { id } });

        if (!existingAddress) {
            return {
                success: false,
                message: 'Dirección no encontrada'
            };
        }

        // Verificar que la dirección pertenece al usuario
        if (existingAddress.user_id !== userId) {
            return {
                success: false,
                message: 'No tienes permiso para modificar esta dirección'
            };
        }

        // Validar que no se esté creando un duplicado al actualizar
        if (addressData.street || addressData.city || addressData.postal_code) {
            const updatedAddressData = {
                ...existingAddress,
                ...addressData
            };

            const isDuplicate = await this.isDuplicateAddress(updatedAddressData, userId, id);
            if (isDuplicate) {
                return {
                    success: false,
                    message: 'Ya tienes una dirección igual o muy similar registrada.'
                };
            }
        }

        // Si la actualización la marca como predeterminada
        if (addressData.is_default) {
            await this.resetDefaultAddress(userId);
        }

        // Actualizar manteniendo el user_id
        await this.addressRepository.update(
            { id },
            {
                ...addressData,
                user_id: existingAddress.user_id
            }
        );

        const updatedAddress = await this.addressRepository.findOne({ where: { id } });
        return {
            success: true,
            data: updatedAddress || undefined
        };
    }

    // Eliminar dirección
    async deleteAddress(id: number, userId: number): Promise<{success: boolean; message?: string}> {
        // Verificar si la dirección existe y pertenece al usuario
        const address = await this.addressRepository.findOne({
            where: { id, user_id: userId }
        });

        if (!address) {
            return {
                success: false,
                message: 'Dirección no encontrada o no pertenece al usuario'
            };
        }

        // Verificar si la dirección está siendo usada en algún pedido
        const ordersWithThisAddress = await this.orderRepository.find({
            where: { address: { id } },
            take: 1 // Solo necesitamos saber si hay al menos uno
        });

        if (ordersWithThisAddress.length > 0) {
            // Si está en uso, marcamos user_id como null en lugar de eliminar
            await this.addressRepository.update(
                { id },
                {
                    user_id: null,
                    is_default: false // No puede ser default si no tiene usuario
                }
            );

            return {
                success: true,
                message: 'Dirección desvinculada pero conservada por estar en pedidos existentes'
            };
        } else {
            // Si no está en uso, eliminamos normalmente
            const result = await this.addressRepository.delete({ id });
            return {
                success: result.affected ? result.affected > 0 : false,
                message: result.affected ? 'Dirección eliminada' : 'No se pudo eliminar la dirección'
            };
        }
    }

    // Marcar una dirección como predeterminada
    async setDefaultAddress(id: number, userId: number): Promise<boolean> {
        // Primero quitar el estado predeterminado de todas las direcciones
        await this.resetDefaultAddress(userId);

        // Luego establecer esta dirección como predeterminada
        const result = await this.addressRepository.update(
            { id, user_id: userId },
            { is_default: true }
        );

        return result.affected ? result.affected > 0 : false;
    }

    // Quitar el estado predeterminado de todas las direcciones
    private async resetDefaultAddress(userId: number): Promise<void> {
        await this.addressRepository.update(
            { user_id: userId, is_default: true },
            { is_default: false }
        );
    }

    // Verificar si ya existe una dirección similar
    private async isDuplicateAddress(addressData: Partial<AdditionalAddress>, userId: number, excludeId?: number): Promise<boolean> {
        // Normalización de datos para comparación
        const normalizedStreet = addressData.street?.toLowerCase().trim();
        const normalizedCity = addressData.city?.toLowerCase().trim();
        const normalizedPostalCode = addressData.postal_code?.trim();

        // Buscar direcciones del usuario
        const userAddresses = await this.addressRepository.find({
            where: { user_id: userId }
        });

        // Filtrar la dirección actual si estamos actualizando
        const addressesToCompare = excludeId
            ? userAddresses.filter(addr => addr.id !== excludeId)
            : userAddresses;

        // Verificar si hay duplicados
        return addressesToCompare.some(addr => {
            const existingStreet = addr.street.toLowerCase().trim();
            const existingCity = addr.city.toLowerCase().trim();
            const existingPostalCode = addr.postal_code.trim();

            // Considerar una dirección duplicada si coinciden calle, ciudad y código postal
            return normalizedStreet === existingStreet &&
                normalizedCity === existingCity &&
                normalizedPostalCode === existingPostalCode;
        });
    }

    async getDefaultAddress(userId: number): Promise<AdditionalAddress | null> {
        return this.addressRepository.findOne({
            where: {
                user_id: userId,
                is_default: true
            }
        });
    }


}