import { Request, Response } from "express";
import { AppDataSource } from "../Config/database";
import { ReviewReport, ReportReason } from "../Entities/ReviewReport";
import { Review } from "../Entities/Review";
import { User } from "../Entities/User";

export class ReviewReportController {
    // Crear reporte de reseña
    async reportReview(req: Request, res: Response): Promise<Response> {
        const { reviewId, reason, other_reason_text } = req.body;
        const userId = req.user?.id;

        if (!reason || !Object.values(ReportReason).includes(reason)) {
            return res.status(400).json({ message: "Motivo de reporte no válido" });
        }


        try {
            const reviewRepo = AppDataSource.getRepository(Review);
            const userRepo = AppDataSource.getRepository(User);
            const reportRepo = AppDataSource.getRepository(ReviewReport);

            const review = await reviewRepo.findOneByOrFail({ review_id: reviewId });
            const user = await userRepo.findOneByOrFail({ user_id: userId });

            const newReport = reportRepo.create({
                user,
                review,
                reason,
                other_reason_text: reason === ReportReason.OTHER ? other_reason_text : null,
            });

            await reportRepo.save(newReport);
            return res.status(201).json({ message: "Reporte enviado correctamente" });

        } catch (error) {
            console.error("Error reportando reseña:", error);
            return res.status(500).json({ message: "Error interno al reportar" });
        }
    }

    // Obtener todos los reportes de reseñas
    async getAllReports(req: Request, res: Response): Promise<Response> {
        try {
            const reportRepo = AppDataSource.getRepository(ReviewReport);
            const reports = await reportRepo.find({
                relations: ["user", "review"],
                order: { reported_at: "DESC" }
            });

            return res.status(200).json(reports);
        } catch (error) {
            console.error("Error al obtener reportes:", error);
            return res.status(500).json({ message: "Error interno al obtener reportes" });
        }
    }
}
