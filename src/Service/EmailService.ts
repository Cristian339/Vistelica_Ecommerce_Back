import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export class EmailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'vistelica.company@gmail.com',
                pass: process.env.PASSWORD_APPLICATION_GMAIL,
            },
        });
    }

    async sendPasswordResetCode(email: string, code: string): Promise<void> {
        const mailOptions = {
            from: 'Vistelica <vistelica.company@gmail.com>',
            to: email,
            subject: 'Código de verificación para restablecer contraseña',
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="https://fonts.googleapis.com/css2?family=Tenor+Sans&display=swap" rel="stylesheet">
                <link href="https://fonts.googleapis.com/css2?family=Amethysta&display=swap" rel="stylesheet">
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Amethysta&family=Tenor+Sans&display=swap');
                    
                    body {
                        font-family: 'Tenor Sans', Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #f8f8f8;
                        color: #333;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border: 1px solid #e0e0e0;
                    }
                    .header {
                        background-color: #c99a02;
                        padding: 20px;
                        text-align: center;
                    }
                    .logo {
                        font-family: 'Amethysta', Georgia, serif;
                        color: #ffffff;
                        font-size: 36px;
                        margin: 0;
                        letter-spacing: 2px;
                    }
                    .content {
                        padding: 30px;
                        line-height: 1.6;
                    }
                    h1 {
                        font-family: 'Amethysta', Georgia, serif;
                        color: #2c3e50;
                        font-size: 24px;
                        margin-bottom: 20px;
                        text-align: center;
                    }
                    .code-container {
                        background-color: #f0f4f8;
                        border: 1px dashed #c0c5ce;
                        border-radius: 4px;
                        padding: 15px;
                        margin: 25px 0;
                        text-align: center;
                    }
                    .code {
                        font-size: 32px;
                        font-weight: bold;
                        color: #2c3e50;
                        letter-spacing: 5px;
                    }
                    .footer {
                        background-color: #f0f4f8;
                        padding: 15px;
                        text-align: center;
                        font-size: 12px;
                        color: #666;
                    }
                    .note {
                        font-style: italic;
                        margin-top: 20px;
                    }
                    .button {
                        display: inline-block;
                        padding: 10px 20px;
                        background-color: #2c3e50;
                        color: white;
                        text-decoration: none;
                        border-radius: 4px;
                        margin-top: 20px;
                        font-family: 'Tenor Sans', Arial, sans-serif;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 class="logo">VISTELICA</h1>
                    </div>
                    <div class="content">
                        <h1>Restablecer Contraseña</h1>
                        <p>Estimado(a) cliente,</p>
                        <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta Vistelica. Para continuar con este proceso, por favor utiliza el siguiente código de verificación:</p>
                        
                        <div class="code-container">
                            <div class="code">${code}</div>
                        </div>
                        
                        <p class="note">Este código expirará en 15 minutos por razones de seguridad.</p>
                        
                        <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este mensaje o contactar con nuestro equipo de soporte.</p>
                        
                        <p>¡Gracias por confiar en Vistelica!</p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} Vistelica - Todos los derechos reservados</p>
                        <p>Este es un mensaje automático, por favor no respondas a este correo.</p>
                    </div>
                </div>
            </body>
            </html>
            `,
        };

        await this.transporter.sendMail(mailOptions);
    }



    // email.service.ts - Método simplificado
    async sendEmailVerificationCode(email: string, code: string): Promise<void> {
        const mailOptions = {
            from: 'Vistelica <vistelica.company@gmail.com>',
            to: email,
            subject: 'Código de verificación para cambio de email',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #c99a02;">VISTELICA</h2>
            <p>Hemos recibido una solicitud para cambiar el email asociado a tu cuenta.</p>
            <p>Utiliza el siguiente código para verificar tu identidad:</p>
            <div style="font-size: 24px; font-weight: bold; letter-spacing: 3px; 
                        margin: 20px 0; padding: 10px; background: #f5f5f5;">
                ${code}
            </div>
            <p style="font-size: 12px; color: #666;">
                Este código expirará en 15 minutos. Si no solicitaste este cambio, 
                por favor ignora este mensaje.
            </p>
        </div>
        `
        };

        await this.transporter.sendMail(mailOptions);
    }
}