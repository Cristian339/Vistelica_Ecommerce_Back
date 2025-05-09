import express, { Router, Request, Response, NextFunction } from "express";
import { AddressController } from "../Controller/AddressController";
import { Auth } from "../Middleware/Auth";

const router: Router = express.Router();
const addressController = new AddressController();
const auth = new Auth();

// Obtener todas las direcciones
router.get('/',
    (req: Request, res: Response, next: NextFunction) => {
        auth.authenticate(req, res, next);
    },
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await addressController.getAddresses(req, res);
        } catch (error) {
            next(error);
        }
    }
);

// Agregar nueva dirección
router.post('/',
    (req: Request, res: Response, next: NextFunction) => {
        auth.authenticate(req, res, next);
    },
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await addressController.addAddress(req, res);
        } catch (error) {
            next(error);
        }
    }
);

// Actualizar dirección
router.put('/:id',
    (req: Request, res: Response, next: NextFunction) => {
        auth.authenticate(req, res, next);
    },
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await addressController.updateAddress(req, res);
        } catch (error) {
            next(error);
        }
    }
);

// Eliminar dirección
router.delete('/:id',
    (req: Request, res: Response, next: NextFunction) => {
        auth.authenticate(req, res, next);
    },
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await addressController.deleteAddress(req, res);
        } catch (error) {
            next(error);
        }
    }
);

/*Método: PATCH No requiere body*/
// Establecer como dirección predeterminada
router.patch('/:id/default',
    (req: Request, res: Response, next: NextFunction) => {
        auth.authenticate(req, res, next);
    },
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await addressController.setDefaultAddress(req, res);
        } catch (error) {
            next(error);
        }
    }
);

// Obtener dirección por defecto
router.get('/default',
    (req: Request, res: Response, next: NextFunction) => {
        auth.authenticate(req, res, next);
    },
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await addressController.getDefaultAddress(req, res);
        } catch (error) {
            next(error);
        }
    }
);


export default router;