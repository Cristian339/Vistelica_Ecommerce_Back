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

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    console.log('POST /login')
    try {
        await userController.login(req, res);
    } catch(error) {
        next(error);
    }
});


export default router;