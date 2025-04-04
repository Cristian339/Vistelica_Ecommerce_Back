import { AppDataSource } from '../Config/database';
import { Supplier } from '../Entities/Supplier';

export class SupplierService {
    private supplierRepository = AppDataSource.getRepository(Supplier);

    // Create a new supplier
    async createSupplier(data: Partial<Supplier>): Promise<Supplier> {
        try {
            // Verificar si el email ya existe
            const existingSupplier = await this.supplierRepository.findOne({
                where: { email: data.email }
            });

            if (existingSupplier) {
                throw new Error("El correo electrónico ya está registrado");
            }

            // Crear el proveedor
            const supplier = this.supplierRepository.create(data);
            const savedSupplier = await this.supplierRepository.save(supplier);

            return savedSupplier;
        } catch (error) {
            console.error('Error al crear proveedor:', error);
            throw new Error("Error al crear el proveedor");
        }
    }

    // Get all suppliers
    async getAllSuppliers(): Promise<Supplier[]> {
        try {
            const suppliers = await this.supplierRepository.find();
            return suppliers;
        } catch (error) {
            console.error('Error al obtener proveedores:', error);
            throw new Error('Error al obtener la lista de proveedores');
        }
    }

    // Get supplier by ID
    async getSupplierById(id: number): Promise<Supplier | null> {
        try {
            const supplier = await this.supplierRepository.findOne({
                where: { supplier_id: id }
            });

            if (!supplier) {
                throw new Error('Proveedor no encontrado');
            }

            return supplier;
        } catch (error) {
            console.error('Error al buscar proveedor por ID:', error);
            throw new Error('Error al obtener el proveedor');
        }
    }

    // Update supplier
    async updateSupplier(id: number, data: Partial<Supplier>): Promise<Supplier> {
        try {
            const supplier = await this.supplierRepository.findOne({
                where: { supplier_id: id }
            });

            if (!supplier) {
                throw new Error('Proveedor no encontrado');
            }

            // Verificar si el nuevo email ya existe
            if (data.email && data.email !== supplier.email) {
                const existingSupplier = await this.supplierRepository.findOne({
                    where: { email: data.email }
                });

                if (existingSupplier) {
                    throw new Error('El correo electrónico ya está en uso');
                }
            }

            // Actualizar los campos
            Object.assign(supplier, data);

            // Guardar cambios
            return await this.supplierRepository.save(supplier);
        } catch (error) {
            console.error('Error al actualizar proveedor:', error);
            throw new Error('Error al actualizar el proveedor');
        }
    }

    // Delete supplier
    async deleteSupplier(id: number): Promise<Supplier> {
        try {
            const supplier = await this.supplierRepository.findOne({
                where: { supplier_id: id }
            });

            if (!supplier) {
                throw new Error('Proveedor no encontrado');
            }

            // Guardar copia antes de eliminar
            const supplierToDelete = { ...supplier };

            // Eliminar
            await this.supplierRepository.delete(id);

            return supplierToDelete;
        } catch (error) {
            console.error('Error al eliminar proveedor:', error);
            throw new Error('Error al eliminar el proveedor');
        }
    }

    // Search suppliers by name
    async searchSuppliersByName(name: string): Promise<Supplier[]> {
        try {
            const suppliers = await this.supplierRepository
                .createQueryBuilder("supplier")
                .where("supplier.name LIKE :name", { name: `%${name}%` })
                .getMany();

            return suppliers;
        } catch (error) {
            console.error('Error al buscar proveedores:', error);
            throw new Error('Error en la búsqueda de proveedores');
        }
    }
}