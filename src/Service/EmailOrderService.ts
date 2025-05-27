    import * as nodemailer from 'nodemailer';
    import { Order } from '../Entities/Order';
    import { Payment } from '../Entities/Payment';
    import { User } from '../Entities/User';

    export class EmailOrderService {
        private transporter: nodemailer.Transporter;

        constructor() {
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.PASSWORD_APPLICATION_GMAIL
                }
            });
        }

        /**
         * Envía el correo de confirmación de pedido
         */
        async sendOrderConfirmationEmail(user: User, order: Order, payment: Payment): Promise<void> {
            try {
                const emailHTML = this.generateOrderEmailHTML(user, order, payment);

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: user.email,
                    subject: `Confirmación de Pedido - ${order.order_number}`,
                    html: emailHTML
                };

                await this.transporter.sendMail(mailOptions);
                console.log(`Correo de confirmación enviado a: ${user.email}`);
            } catch (error) {
                console.error('Error enviando correo de confirmación:', error);
                // No lanzamos error para no afectar la creación del pedido
            }
        }

        /**
         * Genera el HTML del correo de confirmación de pedido
         */
        private generateOrderEmailHTML(user: User, order: Order, payment: Payment): string {
            const userName = user.profile?.name ?
                `${user.profile.name} ${user.profile.lastName || ''}`.trim() :
                'Cliente';

            // Generar lista de productos
            const productsHTML = order.details.map(detail => {
                const mainImage = detail.product.images?.find(img => img.is_main)?.image_url ||
                    detail.product.images?.[0]?.image_url ||
                    '/default-product-image.jpg';
                console.log('📎 URL con inspección:', mainImage);
                console.log(`Imagen principal para el producto ${detail.product.name}: ${mainImage}`);
                const sizeColorInfo = [];
                if (detail.size) sizeColorInfo.push(`Talla: ${detail.size}`);
                if (detail.color) sizeColorInfo.push(`Color: ${detail.color}`);
                const sizeColorText = sizeColorInfo.length > 0 ?
                    `<br><small style="color: #666;">${sizeColorInfo.join(' | ')}</small>` : '';

                return `
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 15px 10px; text-align: center;">
                            <img src="${mainImage}" alt="holaa" 
                                 style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                        </td>
                        <td style="padding: 15px 10px;">
                            <strong>${detail.product.name}</strong>
                            ${sizeColorText}
                        </td>
                        <td style="padding: 15px 10px; text-align: center;">
                            ${detail.quantity}
                        </td>
                        <td style="padding: 15px 10px; text-align: right;">
                            €${Number(detail.price).toFixed(2)}
                        </td>
                        <td style="padding: 15px 10px; text-align: right; font-weight: bold;">
                            €${(Number(detail.price) * detail.quantity).toFixed(2)}
                        </td>
                    </tr>
                `;
            }).join('');

            const subtotal = order.details.reduce((sum, detail) =>
                sum + (Number(detail.price) * detail.quantity), 0);
            const shippingCost = subtotal > 50 ? 0 : 5;

            return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Confirmación de Pedido</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <div style="background-color: #2c3e50; color: white; padding: 30px 20px; text-align: center;">
                        <h1 style="margin: 0; font-size: 28px;">¡Gracias por tu pedido!</h1>
                        <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">
                            Tu pedido ha sido confirmado y está siendo procesado
                        </p>
                    </div>
    
                    <!-- Contenido principal -->
                    <div style="padding: 30px 20px;">
                        
                        <!-- Saludo -->
                        <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                            Hola <strong>${userName}</strong>,
                        </p>
                        
                        <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                            Hemos recibido tu pedido correctamente y está siendo preparado en nuestro almacén. 
                            Te enviaremos actualizaciones sobre el estado de tu pedido a este correo electrónico.
                        </p>
    
                        <!-- Información del pedido -->
                        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                            <h3 style="color: #2c3e50; margin: 0 0 15px 0;">Detalles del Pedido</h3>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span><strong>Número de pedido:</strong></span>
                                <span style="color: #e74c3c; font-weight: bold;">${order.order_number}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span><strong>Fecha del pedido:</strong></span>
                                <span>${order.created_at.toLocaleDateString('es-ES')}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span><strong>Estado:</strong></span>
                                <span style="color: #f39c12; font-weight: bold;">${order.status}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span><strong>Entrega estimada:</strong></span>
                                <span>${order.estimated_delivery_date.toLocaleDateString('es-ES')}</span>
                            </div>
                        </div>
    
                        <!-- Productos -->
                        <h3 style="color: #2c3e50; margin-bottom: 20px;">Productos Pedidos</h3>
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                            <thead>
                                <tr style="background-color: #34495e; color: white;">
                                    <th style="padding: 12px 10px; text-align: center;">Imagen</th>
                                    <th style="padding: 12px 10px; text-align: left;">Producto</th>
                                    <th style="padding: 12px 10px; text-align: center;">Cantidad</th>
                                    <th style="padding: 12px 10px; text-align: right;">Precio</th>
                                    <th style="padding: 12px 10px; text-align: right;">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${productsHTML}
                            </tbody>
                        </table>
    
                        <!-- Resumen de costos -->
                        <div style="background-color: #ecf0f1; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span>Subtotal:</span>
                                <span>€${subtotal.toFixed(2)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span>Envío:</span>
                                <span>${shippingCost === 0 ? 'GRATIS' : `€${shippingCost.toFixed(2)}`}</span>
                            </div>
                            <hr style="border: none; border-top: 1px solid #bdc3c7; margin: 15px 0;">
                            <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #2c3e50;">
                                <span>Total:</span>
                                <span>€${Number(order.total_price).toFixed(2)}</span>
                            </div>
                        </div>
    
                        <!-- Información de pago -->
                        <div style="background-color: #d5f4e6; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                            <h3 style="color: #27ae60; margin: 0 0 15px 0;">Información de Pago</h3>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span><strong>Método de pago:</strong></span>
                                <span>${payment.payment_method}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span><strong>Estado del pago:</strong></span>
                                <span style="color: #27ae60; font-weight: bold;">${payment.payment_status}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span><strong>Importe pagado:</strong></span>
                                <span style="font-weight: bold;">€${Number(payment.amount).toFixed(2)}</span>
                            </div>
                        </div>
    
                        <!-- Dirección de entrega -->
                        <div style="background-color: #fff3cd; border-radius: 8px; padding: 20px; margin-bottom: 25px;">
                            <h3 style="color: #856404; margin: 0 0 15px 0;">Dirección de Entrega</h3>
                            <p style="margin: 0; line-height: 1.6; color: #333;">
                                ${order.address.street}<br>
                                ${order.address.city}, ${order.address.state}<br>
                                ${order.address.postal_code}${order.address.country ? `, ${order.address.country}` : ''}
                            </p>
                        </div>
    
                        <!-- Mensaje final -->
                        <div style="text-align: center; padding: 20px 0; border-top: 1px solid #eee;">
                            <p style="color: #666; margin-bottom: 15px;">
                                Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.
                            </p>
                            <p style="color: #2c3e50; font-weight: bold; margin: 0;">
                                ¡Gracias por confiar en nosotros!
                            </p>
                        </div>
                    </div>
    
                    <!-- Footer -->
                    <div style="background-color: #34495e; color: white; padding: 20px; text-align: center;">
                        <p style="margin: 0; font-size: 14px; opacity: 0.8;">
                            Este es un correo automático, por favor no respondas a este mensaje.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            `;
        }

        /**
         * Método para enviar otros tipos de correos (actualización de estado, etc.)
         */
        async sendOrderStatusUpdateEmail(user: User, order: Order, newStatus: string): Promise<void> {
            try {
                const statusMessages: { [key: string]: string } = {
                    'Pendiente': 'Tu pedido está pendiente de confirmación',
                    'Enviado': 'Tu pedido ha sido enviado y está en camino',
                    'Entregado': 'Tu pedido ha sido entregado correctamente',
                    'Cancelado': 'Tu pedido ha sido cancelado'
                };

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: user.email,
                    subject: `Actualización de Pedido - ${order.order_number}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2>Actualización de tu Pedido</h2>
                            <p>Hola ${user.profile?.name || 'Cliente'},</p>
                            <p>Tu pedido <strong>${order.order_number}</strong> ha cambiado de estado:</p>
                            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h3>Nuevo Estado: <span style="color: #e74c3c;">${newStatus}</span></h3>
                                <p>${statusMessages[newStatus] || 'El estado de tu pedido ha sido actualizado'}</p>
                            </div>
                            <p>Gracias por tu confianza.</p>
                        </div>
                    `
                };

                await this.transporter.sendMail(mailOptions);
                console.log(`Correo de actualización enviado a: ${user.email}`);
            } catch (error) {
                console.error('Error enviando correo de actualización:', error);
            }
        }
    }