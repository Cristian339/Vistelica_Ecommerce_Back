import express, { Router, Request, Response, NextFunction } from "express";
import { AdminController } from "../Controller/AdminController";
import { Auth } from "../Middleware/Auth";

const router: Router = express.Router();
const adminController = new AdminController();
const auth = new Auth();

// Usuarios baneados
router.get('/admin/banned', (req: Request, res: Response, next: NextFunction) => {
    auth.authenticate(req, res, next);
}, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminController.getBannedUsers(req, res);
    } catch (error) {
        next(error);
    }
});

// Usuarios no baneados
router.get('/admin/unbanned', (req: Request, res: Response, next: NextFunction) => {
    auth.authenticate(req, res, next);
}, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminController.getUnbannedUsers(req, res);
    } catch (error) {
        next(error);
    }
});

// Banear usuario
router.post('/admin/ban/:userId', (req: Request, res: Response, next: NextFunction) => {
    auth.authenticate(req, res, next);
}, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminController.banUser(req, res);
    } catch (error) {
        next(error);
    }
});

// Desbanear usuario
router.post('/admin/unban/:userId', (req: Request, res: Response, next: NextFunction) => {
    auth.authenticate(req, res, next);
}, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminController.unbanUser(req, res);
    } catch (error) {
        next(error);
    }
});

// Listar clientes
router.get('/admin/clients', (req: Request, res: Response, next: NextFunction) => {
    auth.authenticate(req, res, next);
}, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminController.getClients(req, res);
    } catch (error) {
        next(error);
    }
});

// Listar vendedores
router.get('/admin/sellers', (req: Request, res: Response, next: NextFunction) => {
    auth.authenticate(req, res, next);
}, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await adminController.getSellers(req, res);
    } catch (error) {
        next(error);
    }
});

export default router;