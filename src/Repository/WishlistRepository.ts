import { Repository } from "typeorm";
import { AppDataSource } from "../Config/database";
import { Wishlist } from "../Entities/Wishlist";
import { User } from "../Entities/User";
import { Products } from "../Entities/Products";

export class WishlistRepository {
    private repo: Repository<Wishlist>;
    private userRepo: Repository<User>;
    private productRepo: Repository<Products>;

    constructor() {
        this.repo = AppDataSource.getRepository(Wishlist);
        this.userRepo = AppDataSource.getRepository(User);
        this.productRepo = AppDataSource.getRepository(Products);
    }

    async addProductToWishlist(userId: number, productId: number): Promise<Wishlist | null> {
        const user = await this.userRepo.findOne({ where: { user_id: userId } });
        const product = await this.productRepo.findOne({ where: { product_id: productId } });

        if (!user || !product) return null;

        const wishlistEntry = this.repo.create({ user, product });
        return await this.repo.save(wishlistEntry);
    }

    async removeProductFromWishlist(userId: number, productId: number): Promise<void> {
        await this.repo.delete({ user: { user_id: userId }, product: { product_id: productId } });
    }

    async getWishlistByUser(userId: number): Promise<Wishlist[]> {
        return await this.repo.find({ where: { user: { user_id: userId } }, relations: ["product"] });
    }
    async findWishlistItem(userId: number, productId: number): Promise<Wishlist | null> {
        return await this.repo.findOne({ where: { user: { user_id: userId }, product: { product_id: productId } } });
    }

}