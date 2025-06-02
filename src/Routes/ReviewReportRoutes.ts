import express, { Router, Request, Response, NextFunction } from "express";
import { ReviewReportController } from "../Controller/ReviewReportController";
import { Auth } from "../Middleware/Auth";

const router: Router = express.Router();
const reportController = new ReviewReportController();
const auth = new Auth();

// Reportar una reseña
router.post('/review/report',
    (req: Request, res: Response, next: NextFunction) => {
        auth.authenticate(req, res, next);
    },
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await reportController.reportReview(req, res);
        } catch (error) {
            next(error);
        }
    }
);


router.get('/review/reports',
    (req: Request, res: Response, next: NextFunction) => {
        auth.authenticate(req, res, next);
    },
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            await reportController.getAllReports(req, res);
        } catch (error) {
            next(error);
        }
    }
);

export default router;
