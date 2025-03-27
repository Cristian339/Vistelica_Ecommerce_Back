import { Request, Response } from "express";
import { WishlistService } from "../Service/WishlistService";

export class WishlistController {
    private wishlistService = new WishlistService();

    async addToWishlist(req: Request, res: Response): Promise<Response> {
        try {
            const { userId, productId } = req.body;
            const wishlistItem = await this.wishlistService.addToWishlist(userId, productId);
            return res.status(201).json(wishlistItem);
        } catch (error) {
            return res.status(500).json({ message: "Error al agregar producto a la lista de deseos", error });
        }
    }

    async removeFromWishlist(req: Request, res: Response): Promise<Response> {
        try {
            const { userId, productId } = req.body;
            await this.wishlistService.removeFromWishlist(userId, productId);
            return res.status(200).json({ message: "Producto eliminado de la lista de deseos" });
        } catch (error) {
            return res.status(500).json({ message: "Error al eliminar producto de la lista de deseos", error });
        }
    }

    async getUserWishlist(req: Request, res: Response): Promise<Response> {
        try {
            const userId = Number(req.params.userId);
            const wishlist = await this.wishlistService.getUserWishlist(userId);
            return res.status(200).json(wishlist);
        } catch (error) {
            return res.status(500).json({ message: "Error al obtener la lista de deseos", error });
        }
    }
}