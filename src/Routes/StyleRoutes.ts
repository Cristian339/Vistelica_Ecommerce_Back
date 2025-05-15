import express, { Request, Response, NextFunction } from 'express';
import { uploadMultiple } from '../Middleware/UploadMiddleware';
import { StyleController } from '../Controller/StyleController';

const router = express.Router();
const styleController = new StyleController();

// Obtener todos los estilos
router.get('/styles', async (req, res, next) => {
    try {
        await styleController.getAll(req, res);
    } catch (error) {
        next(error);
    }
});

// Crear estilo con imágenes
router.post('/styles', uploadMultiple, async (req, res, next) => {
    try {
        await styleController.create(req, res);
    } catch (error) {
        next(error);
    }
});

// Eliminar estilo
router.delete('/styles/:id', async (req, res, next) => {
    try {
        await styleController.delete(req, res);
    } catch (error) {
        next(error);
    }
});

// Obtener estilo por ID
router.get('/styles/:styleId', async (req, res, next) => {
    try {
        await styleController.getById(req, res);
    } catch (error) {
        next(error);
    }
});

// Actualizar estilo
router.put('/styles/:id', async (req, res, next) => {
    try {
        await styleController.update(req, res);
    } catch (error) {
        next(error);
    }
});

export default router;
