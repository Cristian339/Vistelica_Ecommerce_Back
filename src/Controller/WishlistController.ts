import { Request, Response } from "express";
import { WishlistService } from "../Service/WishlistService";

export class WishlistController {
    private wishlistService = new WishlistService();

    async addToWishlist(req: Request, res: Response): Promise<Response> {
        try {
            const userId = req.user?.id // Obtener user_id del middleware de autenticación
            const { product_id } = req.body; // Capturar product_id del JSON enviado

            // Validar que userId y product_id existan y sean números
            if (!userId || !product_id || typeof product_id !== "number") {
                return res.status(400).json({ message: "Datos inválidos. Se requiere userId (autenticado) y product_id numérico." });
            }

            // Verificar si el producto ya está en la wishlist del usuario
            const existingItem = await this.wishlistService.findWishlistItem(userId, product_id);
            if (existingItem) {
                return res.status(400).json({ message: "El producto ya está en la lista de deseos" });
            }

            // Agregar el producto a la lista de deseos
            const wishlistItem = await this.wishlistService.addToWishlist(userId, product_id);
            return res.status(201).json(wishlistItem);
        } catch (error) {
            return res.status(500).json({
                message: "Error al agregar producto a la lista de deseos",
                error: error instanceof Error ? error.message : "Error desconocido"
            });
        }
    }

    async removeFromWishlist(req: Request, res: Response): Promise<Response> {
        try {
            const userId = req.user?.id // Obtener userId del middleware de autenticación
            const { product_id } = req.body; // Capturar product_id del JSON enviado

            // Validar que userId y product_id existan y sean números
            if (!userId || !product_id || typeof product_id !== "number") {
                return res.status(400).json({ message: "Datos inválidos. Se requiere userId (autenticado) y product_id numérico." });
            }

            // Verificar si el producto está en la wishlist antes de eliminarlo
            const existingItem = await this.wishlistService.findWishlistItem(userId, product_id);
            if (!existingItem) {
                return res.status(404).json({ message: "El producto no está en la lista de deseos" });
            }

            // Eliminar el producto de la wishlist
            await this.wishlistService.removeFromWishlist(userId, product_id);
            return res.status(200).json({ message: "Producto eliminado de la lista de deseos" });

        } catch (error) {
            return res.status(500).json({
                message: "Error al eliminar producto de la lista de deseos",
                error: error instanceof Error ? error.message : "Error desconocido"
            });
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