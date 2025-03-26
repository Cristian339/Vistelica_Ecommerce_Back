import express, { Router, Request, Response, NextFunction } from "express";
import { ProfileController } from "../Controller/ProfileController";
import { Auth } from "../Middleware/Auth";

const router: Router = express.Router();
const profileController = new ProfileController();
const auth = new Auth();


router.delete('/account', (req: Request, res: Response, next: NextFunction) => {
    auth.authenticate(req, res, next);
}, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await profileController.deleteAccount(req, res);
    } catch (error) {
        next(error);
    }
});

router.post('/change-password', (req: Request, res: Response, next: NextFunction) => {
    auth.authenticate(req, res, next);
}, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await profileController.changePassword(req, res);
    } catch (error) {
        next(error);
    }
});

export default router;