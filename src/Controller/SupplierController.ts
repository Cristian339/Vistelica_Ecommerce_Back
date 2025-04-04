import { Request, Response } from 'express';
import { SupplierService } from '../Service/SupplierService';

export class SupplierController {
    private supplierService = new SupplierService();

    constructor() {
        this.create = this.create.bind(this);
        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
        this.searchByName = this.searchByName.bind(this);
    }

    async create(req: Request, res: Response): Promise<Response> {
        try {
            const { name, email, address, phone, country, IBAN } = req.body;

            // Validación básica de campos requeridos
            if (!name || !email) {
                return res.status(400).json({ error: 'Nombre y email son campos obligatorios' });
            }

            const supplierData = {
                name,
                email,
                address,
                phone,
                country,
                IBAN
            };

            const supplier = await this.supplierService.createSupplier(supplierData);
            return res.status(201).json(supplier);

        } catch (error) {
            console.error('Error al crear proveedor:', error);
            return res.status(500).json({
                error: 'Error al crear el proveedor',
                message: (error as Error).message
            });
        }
    }

    async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const suppliers = await this.supplierService.getAllSuppliers();
            return res.status(200).json(suppliers);
        } catch (error) {
            console.error('Error al obtener proveedores:', error);
            return res.status(500).json({
                error: 'Error al obtener la lista de proveedores',
                message: (error as Error).message
            });
        }
    }

    async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const supplier = await this.supplierService.getSupplierById(Number(id));

            if (!supplier) {
                return res.status(404).json({ error: 'Proveedor no encontrado' });
            }

            return res.status(200).json({
                supplier_id: supplier.supplier_id,
                name: supplier.name,
                email: supplier.email,
                address: supplier.address,
                phone: supplier.phone,
                country: supplier.country,
                IBAN: supplier.IBAN,
                created_at: supplier.created_at,
                updated_at: supplier.updated_at
            });
        } catch (error) {
            console.error('Error al obtener proveedor:', error);
            return res.status(500).json({
                error: 'Error al obtener el proveedor',
                message: (error as Error).message
            });
        }
    }

    async update(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Validar que al menos un campo sea proporcionado para actualizar
            if (Object.keys(updateData).length === 0) {
                return res.status(400).json({ error: 'No se proporcionaron datos para actualizar' });
            }

            const supplier = await this.supplierService.updateSupplier(Number(id), updateData);
            return res.status(200).json(supplier);
        } catch (error) {
            console.error('Error al actualizar proveedor:', error);
            return res.status(500).json({
                error: 'Error al actualizar el proveedor',
                message: (error as Error).message
            });
        }
    }

    async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const deletedSupplier = await this.supplierService.deleteSupplier(Number(id));
            return res.status(200).json(deletedSupplier);
        } catch (error) {
            console.error('Error al eliminar proveedor:', error);
            return res.status(500).json({
                error: 'Error al eliminar el proveedor',
                message: (error as Error).message
            });
        }
    }

    async searchByName(req: Request, res: Response): Promise<Response> {
        try {
            const { name } = req.query;

            if (!name || typeof name !== 'string') {
                return res.status(400).json({ error: 'Parámetro de búsqueda inválido' });
            }

            const suppliers = await this.supplierService.searchSuppliersByName(name);
            return res.status(200).json(suppliers);
        } catch (error) {
            console.error('Error al buscar proveedores:', error);
            return res.status(500).json({
                error: 'Error en la búsqueda de proveedores',
                message: (error as Error).message
            });
        }
    }
}