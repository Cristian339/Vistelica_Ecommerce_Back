import nodemailer from 'nodemailer';



export class EmailService {
    private transporter;

    constructor() {
        // Configura el transporter (ajusta según tu proveedor de email)
        this.transporter = nodemailer.createTransport({
            service: 'gmail', // o usa SMTP: host, port, etc.
            auth: {
                user: 'vistelica.company@gmail.com',
                pass: process.env.PASSWORD_APPLICATION_GMAIL,
            },
        });
    }

    async sendPasswordResetCode(email: string, code: string): Promise<void> {
        const mailOptions = {
            from: 'vistelica.company@gmail.com', // Use the correct sender email
            to: email,
            subject: 'Código de verificación para restablecer contraseña',
            html: `
        <h1>Restablecer contraseña</h1>
        <p>Tu código de verificación es: <strong>${code}</strong></p>
        <p>Este código expirará en 15 minutos.</p>
      `,
        };

        await this.transporter.sendMail(mailOptions);
    }
}