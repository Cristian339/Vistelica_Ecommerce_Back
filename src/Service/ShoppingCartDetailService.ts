import { AppDataSource } from '../Config/database';
import { CartDetail } from '../Entities/CartDetail';
import { Cart } from '../Entities/Cart';
import { Products } from '../Entities/Products';

export class ShoppingCartDetailService {

    private cartDetailRepository = AppDataSource.getRepository(CartDetail);

    // Añadir un producto al carrito (OrderDetail)
    async addProductToOrder(
        cartId: number,
        productId: number,
        quantity: number,
        price: number,
        size: string | null = null,
        color: string | null = null,
        discount_percentage: number | null = null
    ): Promise<CartDetail> {

        try {
            // Primero verificamos si ya existe un producto igual en el carrito
            const existingItems = await this.cartDetailRepository.find({
                where: {
                    cart: { cart_id: cartId },
                    product: { product_id: productId }
                },
                relations: ["product"]
            });
            console.log(1);

            // Buscamos un item que coincida en talla y color
            const existingItem = existingItems.find(item =>
                item.size === size && item.color === color
            );

            if (existingItem) {
                console.log(2);
                // Si encontramos un item idéntico, actualizamos la cantidad
                existingItem.quantity += quantity;

                // Si hay descuento, actualizamos también el descuento
                if (discount_percentage !== null) {
                    existingItem.discount_percentage = discount_percentage;
                }

                return await this.cartDetailRepository.save(existingItem);
            }

            console.log(3);

            // Si no existe un item idéntico, creamos uno nuevo
            const cart = { cart_id: cartId } as Cart;
            const product = { product_id: productId } as Products;
            console.log(4);
            const cartDetail = this.cartDetailRepository.create({
                cart,
                product,
                quantity,
                price,
                size,
                color,
                discount_percentage
            });
            console.log("OTRA VEEEEEEEEEEE " + JSON.stringify(cartDetail));

            return await this.cartDetailRepository.save(cartDetail);
        } catch (error) {
            console.error('Error al agregar producto al pedido:', error);
            throw new Error('Error al agregar producto al pedido');
        }
    }

    // Eliminar un producto del carrito (OrderDetail)
    async removeProductFromOrder(cartDetailId: number): Promise<void> {
        try {
            const cartDetail = await this.cartDetailRepository.findOneBy({ cart_detail_id: cartDetailId });
            if (!cartDetail) {
                throw new Error('Detalle de pedido no encontrado');
            }
            await this.cartDetailRepository.delete(cartDetailId);
        } catch (error) {
            console.error('Error al eliminar producto del pedido:', error);
            throw new Error('Error al eliminar producto del pedido');
        }
    }

    // Obtener los detalles de un pedido (OrderDetails)
    async getOrderDetails(cartId: number): Promise<CartDetail[]> {
        try {
            const cartDetails = await this.cartDetailRepository.find({
                where: { cart: { cart_id: cartId } },
                relations: ["product"],
            });
            return cartDetails;
        } catch (error) {
            console.error('Error al obtener detalles del pedido:', error);
            throw new Error('Error al obtener detalles del pedido');
        }
    }

    // Actualizar la cantidad de un producto en el carrito (OrderDetail)
    async updateOrderDetailQuantity(cartDetailId: number, quantity: number): Promise<CartDetail> {
        try {
            const cartDetail = await this.cartDetailRepository.findOneBy({ cart_detail_id: cartDetailId });
            if (!cartDetail) {
                throw new Error('Detalle de pedido no encontrado');
            }
            cartDetail.quantity = quantity;
            return await this.cartDetailRepository.save(cartDetail);
        } catch (error) {
            console.error('Error al actualizar cantidad del producto:', error);
            throw new Error('Error al actualizar cantidad del producto');
        }
    }

    async transferOrderDetails(sourceCartId: number, targetCartId: number): Promise<void> {
        try {
            // Obtener todos los cartDetails del cart origen
            const sourceCartDetails = await this.cartDetailRepository.find({
                where: { cart: { cart_id: sourceCartId } },
                relations: ["cart", "product"]
            });

            if (sourceCartDetails.length === 0) {
                return; // No hay detalles que transferir
            }

            // Obtener los cartDetails existentes en el carrito destino para comparar
            const targetCartDetails = await this.cartDetailRepository.find({
                where: { cart: { cart_id: targetCartId } },
                relations: ["product"]
            });

            // Transferir cada cartDetail al nuevo cart
            for (const sourceDetail of sourceCartDetails) {
                // Buscar si existe el mismo producto en el carrito destino
                const existingDetail = targetCartDetails.find(targetDetail =>
                    targetDetail.product.product_id === sourceDetail.product.product_id
                );

                if (existingDetail) {
                    // Verificar si tienen la misma talla
                    if (existingDetail.size === sourceDetail.size) {
                        // Si tienen la misma talla, verificar el color
                        if (existingDetail.color === sourceDetail.color) {
                            // Mismo producto, misma talla y mismo color -> incrementar quantity
                            existingDetail.quantity += sourceDetail.quantity;
                            await this.cartDetailRepository.save(existingDetail);

                            // Eliminar el cartDetail original (del carrito fuente)
                            await this.cartDetailRepository.delete(sourceDetail.cart_detail_id);
                            continue; // Pasamos al siguiente item
                        }
                    }
                    // Si no coinciden talla o color, se añade como nuevo registro
                }

                // Si no existe o no coincide talla/color, crear nuevo registro
                const newDetail = this.cartDetailRepository.create({
                    cart: { cart_id: targetCartId } as Cart,
                    product: sourceDetail.product,
                    quantity: sourceDetail.quantity,
                    price: sourceDetail.price,
                    size: sourceDetail.size,
                    color: sourceDetail.color,
                    discount_percentage: sourceDetail.discount_percentage
                });
                await this.cartDetailRepository.save(newDetail);

                // Eliminar el cartDetail original
                await this.cartDetailRepository.delete(sourceDetail.cart_detail_id);
            }

        } catch (error) {
            console.error('Error al transferir detalles de pedido:', error);
            throw new Error('Error al transferir detalles de pedido');
        }
    }

    async calculateTotalPrice(userId?: number, sessionId?: string): Promise<{
        totalPrice: number,
        discountedTotal: number,
        totalSavings: number,
        itemCount: number,
        cartDetails: CartDetail[]
    }> {
        try {
            let cartDetails: CartDetail[] = [];

            if (userId) {
                // Obtener detalles del carrito para un usuario específico
                cartDetails = await this.cartDetailRepository.find({
                    where: { cart: { user: { user_id: userId } } },
                    relations: ["cart", "product"]
                });
            } else if (sessionId) {
                // Obtener detalles del carrito para una sesión específica
                cartDetails = await this.cartDetailRepository.find({
                    where: { cart: { session_id: sessionId } },
                    relations: ["cart", "product"]
                });
            } else {
                throw new Error('Se requiere userId o sessionId');
            }

            if (cartDetails.length === 0) {
                return {
                    totalPrice: 0,
                    discountedTotal: 0,
                    totalSavings: 0,
                    itemCount: 0,
                    cartDetails: []
                };
            }

            // Calcular totales
            const { total, discountedTotal, savings } = cartDetails.reduce((acc, item) => {
                const price = parseFloat(item.price.toString());
                const quantity = item.quantity;
                const discount = item.discount_percentage ? parseFloat(item.discount_percentage.toString()) : 0;

                const itemTotal = price * quantity;
                const itemDiscounted = discount > 0 ? itemTotal * (1 - discount / 100) : itemTotal;
                const itemSavings = itemTotal - itemDiscounted;

                return {
                    total: acc.total + itemTotal,
                    discountedTotal: acc.discountedTotal + itemDiscounted,
                    savings: acc.savings + itemSavings
                };
            }, { total: 0, discountedTotal: 0, savings: 0 });

            return {
                totalPrice: parseFloat(total.toFixed(2)),
                discountedTotal: parseFloat(discountedTotal.toFixed(2)),
                totalSavings: parseFloat(savings.toFixed(2)),
                itemCount: cartDetails.length,
                cartDetails
            };
        } catch (error) {
            console.error('Error al calcular el precio total:', error);
            throw new Error('Error al calcular el precio total');
        }
    }

}