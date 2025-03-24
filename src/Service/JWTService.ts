import jwt from 'jsonwebtoken';
import { User } from '../Entities/User';

export class JWTService {
    private readonly SECRET_KEY: string = "AIV245YYmIRCEDVzu6RTiDasGyk7aPuKc8EG0bkxkZZ8VGwBMIFYU0DX5HAHHseT";

    generateToken(user: User): string {
        const payload = {
            id: user.user_id,
            email: user.email
        };

        return jwt.sign(payload, this.SECRET_KEY, { expiresIn: '3h' });
    }

    verifyToken(token: string): any {
        try {
            return jwt.verify(token, this.SECRET_KEY);
        } catch (error) {
            throw new Error('Token inválido o expirado');
        }
    }

    decodeToken(token: string): any {
        return jwt.decode(token);
    }
}