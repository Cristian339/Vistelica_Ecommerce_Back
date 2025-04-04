import express, { Router, Request, Response, NextFunction } from "express";
import { AdminController } from "../Controller/AdminController";

const router: Router = express.Router();
const adminController = new AdminController();

// Usuarios baneados

router.get('/admin/banned', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminController.getBannedUsers(req, res);
    } catch (error) {
        next(error);
    }
});

// Usuarios no baneados
router.get('/admin/unbanned', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminController.getUnbannedUsers(req, res);
    } catch (error) {
        next(error);
    }
});

// Banear usuario
router.post('/admin/ban/:userId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminController.banUser(req, res);
    } catch (error) {
        next(error);
    }
});

// Desbanear usuario
router.post('/admin/unban/:userId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminController.unbanUser(req, res);
    } catch (error) {
        next(error);
    }
});

import cors from 'cors';

// Configuración de CORS
const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200
};

// Aplica CORS solo a rutas específicas
router.get('/admin/clients', cors(corsOptions), async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminController.getClients(req, res);
    } catch (error) {
        next(error);
    }
});

// Listar vendedores
router.get('/admin/sellers', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminController.getSellers(req, res);
    } catch (error) {
        next(error);
    }
});

export default router;