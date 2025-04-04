import express, { Router, Request, Response, NextFunction } from "express";
import { SupplierController } from "../Controller/SupplierController";
import cors from 'cors';

const router: Router = express.Router();
const supplierController = new SupplierController();

// Configuración de CORS
const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
};

// Crear un nuevo proveedor
router.post('/suppliers',
    cors(corsOptions),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await supplierController.create(req, res);
        } catch (error) {
            next(error);
        }
    }
);

// Obtener todos los proveedores
router.get('/suppliers',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await supplierController.getAll(req, res);
        } catch (error) {
            next(error);
        }
    }
);

// Buscar proveedores por nombre
router.get('/suppliers/search',
    cors(corsOptions),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await supplierController.searchByName(req, res);
        } catch (error) {
            next(error);
        }
    }
);

// Obtener un proveedor por ID
router.get('/suppliers/:id',
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await supplierController.getById(req, res);
        } catch (error) {
            next(error);
        }
    }
);

// Actualizar un proveedor
router.put('/suppliers/:id',
    cors(corsOptions),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await supplierController.update(req, res);
        } catch (error) {
            next(error);
        }
    }
);

// Eliminar un proveedor
router.delete('/suppliers/:id',
    cors(corsOptions),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await supplierController.delete(req, res);
        } catch (error) {
            next(error);
        }
    }
);

export default router;