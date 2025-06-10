import * as nodemailer from 'nodemailer';

export class EmailWelcomeService {
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
     * Envía email de bienvenida después del registro exitoso
     */
    async sendWelcomeEmail(email: string, name?: string): Promise<void> {
        try {
            const emailHTML = this.generateWelcomeEmailHTML(name);

            const mailOptions = {
                from: 'Vistelica <vistelica.company@gmail.com>',
                to: email,
                subject: '¡Bienvenido a Vistelica! Tu cuenta está lista',
                html: emailHTML
            };

            await this.transporter.sendMail(mailOptions);

        } catch (error) {
            console.error('Error enviando correo de bienvenida:', error);
            throw new Error('Error al enviar el correo de bienvenida');
        }
    }

    /**
     * Genera el HTML del correo de bienvenida
     */
    private generateWelcomeEmailHTML(name?: string): string {
        const userName = name || 'Usuario';

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://fonts.googleapis.com/css2?family=Tenor+Sans&display=swap" rel="stylesheet">
            <link href="https://fonts.googleapis.com/css2?family=Amethysta&display=swap" rel="stylesheet">
            <title>¡Bienvenido a Vistelica!</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Amethysta&family=Tenor+Sans&display=swap');
                
                body {
                    font-family: 'Tenor Sans', Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f8f8f8;
                    color: #333;
                }
            </style>
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Tenor Sans', Arial, sans-serif; background-color: #f8f8f8;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; border: 1px solid #e0e0e0;">
                
                <!-- Header -->
                <div style="background-color: #c99a02; color: white; padding: 40px 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 36px; font-family: 'Amethysta', Georgia, serif; letter-spacing: 2px;">VISTELICA</h1>
                    <p style="margin: 20px 0 0 0; font-size: 20px; opacity: 0.9;">
                        ¡Bienvenido a nuestra familia!
                    </p>
                    <p style="margin: 5px 0 0 0; font-size: 16px; opacity: 0.8;">
                        Tu cuenta ha sido creada exitosamente
                    </p>
                </div>

                <!-- Contenido principal -->
                <div style="padding: 40px 30px;">
                    
                    <!-- Saludo principal -->
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="font-family: 'Amethysta', Georgia, serif; color: #2c3e50; font-size: 28px; margin-bottom: 15px;">
                            ¡Hola ${userName}!
                        </h1>
                        <p style="font-size: 18px; color: #c99a02; font-weight: bold; margin: 0;">
                            🎉 ¡Tu registro fue exitoso! 🎉
                        </p>
                    </div>
                    
                    <!-- Mensaje de bienvenida -->
                    <div style="background-color: #f0f4f8; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
                        <p style="color: #2c3e50; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                            Nos emociona tenerte como parte de la familia Vistelica. Ahora puedes explorar nuestra 
                            exclusiva colección de moda y descubrir las últimas tendencias que hemos seleccionado especialmente para ti.
                        </p>
                        <div style="background-color: #c99a02; color: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 0; font-size: 18px; font-weight: bold;">
                                ✨ ¡Tu cuenta está 100% activa! ✨
                            </p>
                        </div>
                    </div>

                    <!-- Beneficios -->
                    <div style="margin: 30px 0;">
                        <h3 style="color: #2c3e50; margin: 0 0 20px 0; font-family: 'Amethysta', Georgia, serif; font-size: 20px; text-align: center;">
                            Lo que puedes hacer ahora:
                        </h3>
                        <div style="background-color: #fff; border-left: 4px solid #c99a02; padding: 25px; margin: 20px 0;">
                            <div style="display: flex; flex-direction: column; gap: 15px;">
                                <p style="margin: 0; color: #2c3e50; font-size: 16px;">
                                    🛍️ <strong>Explorar nuestro catálogo completo</strong> - Descubre las últimas tendencias
                                </p>
                                <p style="margin: 0; color: #2c3e50; font-size: 16px;">
                                    💝 <strong>Crear tu lista de deseos</strong> - Guarda tus prendas favoritas
                                </p>
                                <p style="margin: 0; color: #2c3e50; font-size: 16px;">
                                    🛒 <strong>Realizar compras fácilmente</strong> - Proceso de compra simplificado
                                </p>
                                <p style="margin: 0; color: #2c3e50; font-size: 16px;">
                                    📦 <strong>Seguir tus pedidos</strong> - Mantente al día con tus envíos
                                </p>
                                <p style="margin: 0; color: #2c3e50; font-size: 16px;">
                                    🎁 <strong>Acceder a ofertas exclusivas</strong> - Descuentos especiales para miembros
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Call to Action -->
                    <div style="background-color: #f9f9f9; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center;">
                        <h3 style="color: #2c3e50; margin: 0 0 15px 0; font-family: 'Amethysta', Georgia, serif; font-size: 20px;">
                            ¿Listo para comenzar?
                        </h3>
                        <p style="color: #666; margin-bottom: 25px; line-height: 1.6;">
                            Visita nuestra tienda y descubre la moda que se adapta a tu estilo único.
                        </p>
                        <div style="margin: 20px 0;">
                            <a href="#" style="background-color: #c99a02; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                                Explorar Catálogo
                            </a>
                        </div>
                    </div>

                    <!-- Mensaje personalizado -->
                    <div style="background-color: #fff3cd; border: 1px solid #c99a02; border-radius: 8px; padding: 20px; margin: 25px 0;">
                        <p style="color: #856404; margin: 0; font-size: 15px; text-align: center; line-height: 1.6;">
                            <strong>💌 Consejo especial:</strong> Sigue nuestras redes sociales para estar al día 
                            con las últimas colecciones, ofertas flash y tips de moda.
                        </p>
                    </div>

                    <!-- Agradecimiento final -->
                    <div style="text-align: center; padding: 25px 0; border-top: 1px solid #e0e0e0;">
                        <p style="color: #2c3e50; font-size: 16px; margin: 0 0 10px 0; line-height: 1.6;">
                            Gracias por confiar en Vistelica para expresar tu estilo único.
                        </p>
                        <p style="color: #c99a02; font-weight: bold; margin: 0; font-size: 18px; font-family: 'Amethysta', Georgia, serif;">
                            ¡Esperamos verte pronto explorando nuestra tienda!
                        </p>
                    </div>
                </div>

                <!-- Footer -->
                <div style="background-color: #f0f4f8; padding: 25px 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <div style="margin-bottom: 15px;">
                        <p style="margin: 0; font-size: 14px; color: #666; font-weight: bold;">
                            Síguenos en nuestras redes sociales
                        </p>
                        <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">
                            Instagram | Facebook | TikTok
                        </p>
                    </div>
                    <p style="margin: 0; font-size: 12px; color: #666;">
                        &copy; ${new Date().getFullYear()} Vistelica - Todos los derechos reservados
                    </p>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">
                        Este es un correo automático, por favor no respondas a este mensaje.
                    </p>
                    <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">
                        ¿Necesitas ayuda? Contacta con nuestro soporte: vistelica.company@gmail.com
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }
}