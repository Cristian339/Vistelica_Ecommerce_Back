import express, { Request, Response, NextFunction } from "express";
import { UserController } from "../Controller/UserController";
import { Auth } from "../Middleware/Auth";

const router = express.Router();
const userController = new UserController();
const auth = new Auth(); // Create an instance of Auth

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    console.log('POST /register')
    try {
        await userController.registerUser(req, res);
    } catch(error) {
        next(error);
    }
});

router.post("/user",
    (req: Request, res: Response, next: NextFunction) => {
        auth.authenticate(req, res, next);
    },
    async (req: Request, res: Response, next: NextFunction) => {
        try {

            await userController.getUserByToken(req, res);
        } catch (error) {
            next(error);
        }
    }
);

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    console.log('POST /login')
    try {
        await userController.login(req, res);
    } catch(error) {
        next(error);
    }
});


router.post('/reset-password-request', async (req: Request, res: Response, next: NextFunction) => {
    console.log('POST /reset-password-request')
    try {
        await userController.requestPasswordReset(req, res);
    } catch(error) {
        next(error);
    }
});

router.post('/reset-password', async (req: Request, res: Response, next: NextFunction) => {
    console.log('POST /reset-password')
    try {
        await userController.resetPassword(req, res);
    } catch(error) {
        next(error);
    }
});

router.post('/check-email', async (req: Request, res: Response, next: NextFunction) => {
    console.log('POST /check-email')
    try {
        await userController.checkEmailAvailability(req, res);
    } catch(error) {
        next(error);
    }
});

router.post('/check-phone', async (req: Request, res: Response, next: NextFunction) => {
    console.log('POST /check-phone')
    try {
        await userController.checkPhoneAvailability(req, res);
    } catch(error) {
        next(error);
    }
});





export default router;