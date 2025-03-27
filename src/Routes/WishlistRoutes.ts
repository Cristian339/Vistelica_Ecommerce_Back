import { Router, Request, Response, NextFunction } from "express";
import { WishlistController } from "../Controller/WishlistController";
import { Auth } from "../Middleware/Auth";

const router = Router();
const wishlistController = new WishlistController();
const auth = new Auth();
router.post("/wishlist/add", (req: Request, res: Response, next: NextFunction) => {
    auth.authenticate(req, res, next);
}, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await wishlistController.addToWishlist(req, res);
    } catch (error) {
        next(error);
    }
});

router.delete("/wishlist/remove", (req: Request, res: Response, next: NextFunction) => {
    auth.authenticate(req, res, next);
}, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await wishlistController.removeFromWishlist(req, res);
    } catch (error) {
        next(error);
    }
});

router.get("/wishlist/user/:userId", (req: Request, res: Response, next: NextFunction) => {
    auth.authenticate(req, res, next);
}, async (req: Request, res: Response, next: NextFunction) => {
    try {
        await wishlistController.getUserWishlist(req, res);
    } catch (error) {
        next(error);
    }
});

export default router;