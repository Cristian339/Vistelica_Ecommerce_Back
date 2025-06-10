import express, { Request, Response, NextFunction } from "express";
import { UserController } from "../Controller/UserController";
import { Auth } from "../Middleware/Auth";

const router = express.Router();
const userController = new UserController();
const auth = new Auth(); // Create an instance of Auth



// Iniciar proceso de registro (envía código de verificación)
router.post('/initiate-registration', async (req: Request, res: Response, next: NextFunction) => {
    console.log('POST /initiate-registration');
    try {
        await userController.initiateRegistration(req, res);
    } catch(error) {
        next(error);
    }
});

// Verificar código y completar registro
router.post('/verify-registration', async (req: Request, res: Response, next: NextFunction) => {
    console.log('POST /verify-registration');
    try {
        await userController.verifyRegistration(req, res);
    } catch(error) {
        next(error);
    }
});

// Reenviar código de verificación
router.post('/resend-verification-code', async (req: Request, res: Response, next: NextFunction) => {
    console.log('POST /resend-verification-code');
    try {
        await userController.resendVerificationCode(req, res);
    } catch(error) {
        next(error);
    }
});

// Cancelar registro pendiente
router.post('/cancel-registration', async (req: Request, res: Response, next: NextFunction) => {
    console.log('POST /cancel-registration');
    try {
        await userController.cancelRegistration(req, res);
    } catch(error) {
        next(error);
    }
});

// Obtener estado del registro
router.get('/registration-status/:registrationToken', async (req: Request, res: Response, next: NextFunction) => {
    console.log('GET /registration-status/:registrationToken');
    try {
        await userController.getRegistrationStatus(req, res);
    } catch(error) {
        next(error);
    }
});

// ========== RUTA DEPRECADA (mantener para compatibilidad) ==========
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    console.log('POST /register (DEPRECATED)');
    try {
        await userController.registerUser(req, res);
    } catch(error) {
        next(error);
    }
});


router.post("/user",
    (req: Request, res: Response, next: NextFunction) => {
        auth.authenticate(req, res, next);
    },
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await userController.getUserByToken(req, res);
        } catch (error) {
            next(error);
        }
    }
);

router.delete('/user',
    (req: Request, res: Response, next: NextFunction) => {
        auth.authenticate(req, res, next);
    },
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await userController.deleteUser(req, res);
        } catch(error) {
            next(error);
        }
    }
);

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await userController.login(req, res);
    } catch(error) {
        next(error);
    }
});

router.post('/reset-password-request', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await userController.requestPasswordReset(req, res);
    } catch(error) {
        next(error);
    }
});

router.post('/verify-reset-code', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await userController.verifyResetCode(req, res);
    } catch(error) {
        next(error);
    }
});

router.post('/complete-password-reset', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await userController.completePasswordReset(req, res);
    } catch(error) {
        next(error);
    }
});

router.post('/check-email', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await userController.checkEmailAvailability(req, res);
    } catch(error) {
        next(error);
    }
});

router.post('/check-phone', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await userController.checkPhoneAvailability(req, res);
    } catch(error) {
        next(error);
    }
});

router.post('/social-auth', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await userController.socialAuth(req, res);
    } catch(error) {
        next(error);
    }
});

router.post('/logout',
    (req: Request, res: Response, next: NextFunction) => {
        auth.authenticate(req, res, next);
    },
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await userController.logout(req, res);
        } catch(error) {
            next(error);
        }
    }
);

router.post('/verify-password',
    (req: Request, res: Response, next: NextFunction) => {
        auth.authenticate(req, res, next);
    },
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await userController.verifyPassword(req, res);
        } catch(error) {
            next(error);
        }
    }
);

router.post('/request-email-change',
    (req: Request, res: Response, next: NextFunction) => {
        auth.authenticate(req, res, next);
    },
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await userController.sendEmailChangeVerification(req, res);
        } catch(error) {
            next(error);
        }
    }
);

// Ruta para confirmar cambio de email con código
router.post('/confirm-email-change',
    (req: Request, res: Response, next: NextFunction) => {
        auth.authenticate(req, res, next);
    },
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await userController.confirmEmailChange(req, res);
        } catch(error) {
            next(error);
        }
    }
);

export default router;