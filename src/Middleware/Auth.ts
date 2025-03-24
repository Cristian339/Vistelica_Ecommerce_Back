import { Request, Response, NextFunction } from 'express';
import { isAfter, fromUnixTime } from 'date-fns';
import { JWTService } from "../Service/JWTService";
import { DecodedTokenDTO } from '../DTO/DecodedTokenDTO';

declare global {
    namespace Express {
        interface Request {
            user?: DecodedTokenDTO;
        }
    }
}

export class Auth {
    private readonly jwtService: JWTService;

    constructor() {
        this.jwtService = new JWTService();
    }

    authenticate = (req: Request, res: Response, next: NextFunction) => {
        try {
            // Verificar si existe header de autorización
            if (!req.headers.authorization) {
                return res.status(403).json({
                    message: "La petición no tiene la cabecera de Autenticación"
                });
            }

            // Limpiar el token (eliminar comillas si existen)
            const token = req.headers.authorization.replace(/['"]+/g, "");

            // Verificar si es formato Bearer
            if (!token.startsWith('Bearer ')) {
                return res.status(401).json({
                    message: "Formato de token inválido"
                });
            }

            // Extraer el token sin el prefix "Bearer "
            const tokenValue = token.split(' ')[1];

            // Verificar el token
            const decoded = this.jwtService.verifyToken(tokenValue);

            // Verificar expiración de forma explícita
            const tokenExpirationDate = decoded.exp ? fromUnixTime(decoded.exp) : null;

            if (tokenExpirationDate && isAfter(new Date(), tokenExpirationDate)) {
                return res.status(401).json({ message: "El token ha expirado" });
            }

            // Añadir info del usuario al request
            req.user = new DecodedTokenDTO(decoded);

            // Continuar al siguiente middleware
            next();
        } catch (error) {
            return res.status(401).json({ message: "Token inválido" });
        }
    }

}