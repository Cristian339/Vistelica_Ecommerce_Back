import { Repository } from "typeorm";
import { AppDataSource } from "../Config/database";
import { Wishlist } from "../Entities/Wishlist";

export class WishlistRepository {
    private repo: Repository<Wishlist>;

    constructor() {
        this.repo = AppDataSource.getRepository(Wishlist);
    }

    async addProductToWishlist(userId: number, productId: number): Promise<Wishlist> {
        const wishlistEntry = this.repo.create({ user: { user_id: userId }, product: { product_id: productId } });
        return await this.repo.save(wishlistEntry);
    }

    async removeProductFromWishlist(userId: number, productId: number): Promise<void> {
        await this.repo.delete({ user: { user_id: userId }, product: { product_id: productId } });
    }

    async getWishlistByUser(userId: number): Promise<Wishlist[]> {
        return await this.repo.find({ where: { user: { user_id: userId } }, relations: ["product"] });
    }
}
