import * as nodemailer from 'nodemailer';

export class EmailVerificationService {
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
     * Envía email de verificación para registro de usuario
     */
    async sendRegistrationVerificationEmail(email: string, code: string, name?: string): Promise<void> {
        try {
            const emailHTML = this.generateVerificationEmailHTML(code, name);

            const mailOptions = {
                from: 'Vistelica <vistelica.company@gmail.com>',
                to: email,
                subject: 'Verificación de Email - Completa tu registro en Vistelica',
                html: emailHTML
            };

            await this.transporter.sendMail(mailOptions);

        } catch (error) {
            console.error('Error enviando correo de verificación:', error);
            throw new Error('Error al enviar el correo de verificación');
        }
    }

    /**
     * Genera el HTML del correo de verificación
     */
    private generateVerificationEmailHTML(code: string, name?: string): string {
        const userName = name || 'Usuario';

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://fonts.googleapis.com/css2?family=Tenor+Sans&display=swap" rel="stylesheet">
            <link href="https://fonts.googleapis.com/css2?family=Amethysta&display=swap" rel="stylesheet">
            <title>Verificación de Email - Vistelica</title>
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
                <div style="background-color: #c99a02; color: white; padding: 30px 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 36px; font-family: 'Amethysta', Georgia, serif; letter-spacing: 2px;">VISTELICA</h1>
                    <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.9;">
                        ¡Te damos la bienvenida!
                    </p>
                    <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">
                        Verifica tu correo electrónico para completar tu registro
                    </p>
                </div>

                <!-- Contenido principal -->
                <div style="padding: 30px;">
                    
                    <!-- Saludo -->
                    <h1 style="font-family: 'Amethysta', Georgia, serif; color: #2c3e50; font-size: 24px; margin-bottom: 20px; text-align: center;">
                        Verificación de Email
                    </h1>
                    
                    <p style="font-size: 16px; color: #333; margin-bottom: 20px; line-height: 1.6;">
                        Hola <strong>${userName}</strong>,
                    </p>
                    
                    <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                        Gracias por registrarte en Vistelica. Para completar tu registro y acceder a todas nuestras funcionalidades,
                        necesitamos verificar tu dirección de correo electrónico.
                    </p>

                    <!-- Código de verificación -->
                    <div style="background-color: #f0f4f8; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center; border: 2px dashed #c99a02;">
                        <h3 style="color: #2c3e50; margin: 0 0 15px 0; font-family: 'Amethysta', Georgia, serif; font-size: 18px;">
                            Tu código de verificación es:
                        </h3>
                        <div style="background-color: #c99a02; color: white; font-size: 32px; font-weight: bold; padding: 20px; border-radius: 8px; letter-spacing: 4px; margin: 15px 0; font-family: 'Tenor Sans', monospace;">
                            ${code}
                        </div>
                        <p style="color: #666; font-size: 14px; margin: 15px 0 0 0;">
                            Este código expira en <strong>15 minutos</strong>
                        </p>
                    </div>

                    <!-- Instrucciones -->
                    <div style="background-color: #fff; border-left: 4px solid #c99a02; padding: 20px; margin: 25px 0;">
                        <h3 style="color: #2c3e50; margin: 0 0 15px 0; font-family: 'Amethysta', Georgia, serif; font-size: 16px;">
                            Instrucciones:
                        </h3>
                        <ol style="color: #666; line-height: 1.6; margin: 0; padding-left: 20px;">
                            <li>Copia el código de verificación mostrado arriba</li>
                            <li>Regresa a la página de registro</li>
                            <li>Ingresa el código en el campo correspondiente</li>
                            <li>¡Listo! Tu cuenta estará activa</li>
                        </ol>
                    </div>

                    <!-- Información adicional -->
                    <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 25px 0;">
                        <p style="color: #666; margin: 0; font-size: 14px; line-height: 1.6;">
                            <strong>¿No solicitaste este registro?</strong><br>
                            Si no intentaste registrarte en Vistelica, puedes ignorar este correo de forma segura. 
                            El código expirará automáticamente.
                        </p>
                    </div>

                    <!-- Mensaje de bienvenida -->
                    <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e0e0e0;">
                        <p style="color: #666; margin-bottom: 15px; line-height: 1.6;">
                            Una vez verificado tu email, podrás disfrutar de:
                        </p>
                        <div style="background-color: #f0f4f8; border-radius: 8px; padding: 20px; margin: 15px 0;">
                            <p style="margin: 8px 0; color: #2c3e50;">✨ Acceso completo a nuestro catálogo</p>
                            <p style="margin: 8px 0; color: #2c3e50;">🛍️ Gestión de tu carrito de compras</p>
                            <p style="margin: 8px 0; color: #2c3e50;">❤️ Lista de deseos personalizada</p>
                            <p style="margin: 8px 0; color: #2c3e50;">📦 Seguimiento de tus pedidos</p>
                            <p style="margin: 8px 0; color: #2c3e50;">🎁 Ofertas y descuentos exclusivos</p>
                        </div>
                        <p style="color: #c99a02; font-weight: bold; margin: 20px 0 0 0; font-size: 16px;">
                            ¡Estamos emocionados de tenerte con nosotros!
                        </p>
                    </div>
                </div>

                <!-- Footer -->
                <div style="background-color: #f0f4f8; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="margin: 0; font-size: 12px; color: #666;">
                        &copy; ${new Date().getFullYear()} Vistelica - Todos los derechos reservados
                    </p>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">
                        Este es un correo automático, por favor no respondas a este mensaje.
                    </p>
                    <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">
                        Si tienes problemas, contacta con nuestro soporte: vistelica.company@gmail.com
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Reenvía el código de verificación
     */
    async resendVerificationCode(email: string, code: string, name?: string): Promise<void> {
        try {
            const emailHTML = this.generateResendVerificationHTML(code, name);

            const mailOptions = {
                from: 'Vistelica <vistelica.company@gmail.com>',
                to: email,
                subject: 'Reenvío - Código de Verificación Vistelica',
                html: emailHTML
            };

            await this.transporter.sendMail(mailOptions);

        } catch (error) {
            console.error('Error reenviando código de verificación:', error);
            throw new Error('Error al reenviar el código de verificación');
        }
    }

    /**
     * Genera HTML para reenvío de código
     */
    private generateResendVerificationHTML(code: string, name?: string): string {
        const userName = name || 'Usuario';

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="https://fonts.googleapis.com/css2?family=Tenor+Sans&display=swap" rel="stylesheet">
            <link href="https://fonts.googleapis.com/css2?family=Amethysta&display=swap" rel="stylesheet">
            <title>Reenvío Código de Verificación - Vistelica</title>
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
                <div style="background-color: #c99a02; color: white; padding: 30px 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 36px; font-family: 'Amethysta', Georgia, serif; letter-spacing: 2px;">VISTELICA</h1>
                    <p style="margin: 15px 0 0 0; font-size: 18px; opacity: 0.9;">
                        Código de Verificación
                    </p>
                    <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">
                        Aquí tienes tu nuevo código
                    </p>
                </div>

                <!-- Contenido principal -->
                <div style="padding: 30px;">
                    <h1 style="font-family: 'Amethysta', Georgia, serif; color: #2c3e50; font-size: 24px; margin-bottom: 20px; text-align: center;">
                        Reenvío de Código
                    </h1>
                    
                    <p style="font-size: 16px; color: #333; margin-bottom: 20px; line-height: 1.6;">
                        Hola <strong>${userName}</strong>,
                    </p>
                    
                    <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
                        Has solicitado que te reenviemos tu código de verificación. Aquí tienes tu nuevo código:
                    </p>

                    <!-- Código de verificación -->
                    <div style="background-color: #f0f4f8; border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center; border: 2px dashed #c99a02;">
                        <h3 style="color: #2c3e50; margin: 0 0 15px 0; font-family: 'Amethysta', Georgia, serif; font-size: 18px;">
                            Tu nuevo código es:
                        </h3>
                        <div style="background-color: #c99a02; color: white; font-size: 32px; font-weight: bold; padding: 20px; border-radius: 8px; letter-spacing: 4px; margin: 15px 0; font-family: 'Tenor Sans', monospace;">
                            ${code}
                        </div>
                        <p style="color: #666; font-size: 14px; margin: 15px 0 0 0;">
                            Este código expira en <strong>15 minutos</strong>
                        </p>
                    </div>

                    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
                        <p style="color: #856404; margin: 0; font-size: 14px;">
                            <strong>Importante:</strong> Tu código anterior ya no es válido. Usa únicamente este nuevo código.
                        </p>
                    </div>

                    <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e0e0e0;">
                        <p style="color: #666; margin-bottom: 15px; line-height: 1.6;">
                            Ingresa este código en la página de registro para completar tu cuenta.
                        </p>
                        <p style="color: #c99a02; font-weight: bold; margin: 0;">
                            ¡Gracias por elegir Vistelica!
                        </p>
                    </div>
                </div>

                <!-- Footer -->
                <div style="background-color: #f0f4f8; padding: 20px; text-align: center; border-top: 1px solid #e0e0e0;">
                    <p style="margin: 0; font-size: 12px; color: #666;">
                        &copy; ${new Date().getFullYear()} Vistelica - Todos los derechos reservados
                    </p>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">
                        Este es un correo automático, por favor no respondas a este mensaje.
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }
}