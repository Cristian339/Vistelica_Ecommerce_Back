import { WishlistRepository } from "../Repository/WishlistRepository";

export class WishlistService {
    private wishlistRepo = new WishlistRepository();

    async addToWishlist(userId: number, productId: number) {
        return await this.wishlistRepo.addProductToWishlist(userId, productId);
    }

    async removeFromWishlist(userId: number, productId: number) {
        return await this.wishlistRepo.removeProductFromWishlist(userId, productId);
    }

    async getUserWishlist(userId: number) {
        return await this.wishlistRepo.getWishlistByUser(userId);
    }
    async findWishlistItem(userId: number, productId: number) {
        return await this.wishlistRepo.findWishlistItem(userId, productId);
    }

}
