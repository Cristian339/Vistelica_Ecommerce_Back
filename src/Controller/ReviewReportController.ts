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

    // Obtener todas las reseñas reportadas (agrupadas por reseña)
    async getReportedReviews(req: Request, res: Response): Promise<Response> {
        try {
            const reportRepo = AppDataSource.getRepository(ReviewReport);

            // Obtener todas las reseñas que tienen reportes incluyendo producto e imagen principal
            const reports = await reportRepo
                .createQueryBuilder("report")
                .leftJoinAndSelect("report.review", "review")
                .leftJoinAndSelect("report.user", "user")
                .leftJoinAndSelect("review.user", "reviewUser")
                .leftJoinAndSelect("review.product", "product")
                .leftJoinAndSelect("product.images", "image", "image.is_main = true")
                .orderBy("report.reported_at", "DESC")
                .getMany();

            // Agrupar reportes por reseña
            const reportedReviews = reports.reduce((acc, report) => {
                const reviewId = report.review.review_id;

                if (!acc[reviewId]) {
                    acc[reviewId] = {
                        review: {
                            ...report.review,
                            product: {
                                ...report.review.product,
                                // Obtener solo la imagen principal
                                mainImage: report.review.product.images?.find(img => img.is_main)?.image_url || null
                            }
                        },
                        totalReports: 0,
                        reports: []
                    };
                }

                acc[reviewId].totalReports++;
                acc[reviewId].reports.push({
                    report_id: report.report_id,
                    reason: report.reason,
                    other_reason_text: report.other_reason_text,
                    reported_at: report.reported_at,
                    reporter: {
                        user_id: report.user.user_id,
                        email: report.user.email,
                    }
                });

                return acc;
            }, {} as any);

            // Convertir a array y ordenar por número de reportes
            const result = Object.values(reportedReviews).sort((a: any, b: any) =>
                b.totalReports - a.totalReports
            );

            return res.status(200).json(result);
        } catch (error) {
            console.error("Error al obtener reseñas reportadas:", error);
            return res.status(500).json({ message: "Error interno al obtener reseñas reportadas" });
        }
    }

    // Obtener todos los reportes de reseñas (método original)
    async getAllReports(req: Request, res: Response): Promise<Response> {
        try {
            const reportRepo = AppDataSource.getRepository(ReviewReport);
            const reports = await reportRepo.find({
                relations: ["user", "review", "review.user", "review.product"],
                order: { reported_at: "DESC" }
            });

            return res.status(200).json(reports);
        } catch (error) {
            console.error("Error al obtener reportes:", error);
            return res.status(500).json({ message: "Error interno al obtener reportes" });
        }
    }

    // Eliminar una reseña (y todos sus reportes automáticamente por CASCADE)
    async deleteReview(req: Request, res: Response): Promise<Response> {
        const { reviewId } = req.params;

        try {
            const reviewRepo = AppDataSource.getRepository(Review);

            // Verificar que la reseña existe
            const review = await reviewRepo.findOne({
                where: { review_id: parseInt(reviewId) },
                relations: ["user", "product"]
            });

            if (!review) {
                return res.status(404).json({ message: "Reseña no encontrada" });
            }

            // Eliminar la reseña (los reportes se eliminan automáticamente por CASCADE)
            await reviewRepo.remove(review);

            return res.status(200).json({
                message: "Reseña eliminada correctamente",
                deletedReview: {
                    review_id: review.review_id,
                    user: review.user.user_id,
                    product: review.product.name
                }
            });

        } catch (error) {
            console.error("Error al eliminar reseña:", error);
            return res.status(500).json({ message: "Error interno al eliminar reseña" });
        }
    }

    // Eliminar un reporte específico
    async deleteReport(req: Request, res: Response): Promise<Response> {
        const { reportId } = req.params;

        try {
            const reportRepo = AppDataSource.getRepository(ReviewReport);

            // Verificar que el reporte existe
            const report = await reportRepo.findOne({
                where: { report_id: parseInt(reportId) },
                relations: ["user", "review"]
            });

            if (!report) {
                return res.status(404).json({ message: "Reporte no encontrado" });
            }

            // Eliminar el reporte
            await reportRepo.remove(report);

            return res.status(200).json({
                message: "Reporte eliminado correctamente",
                deletedReport: {
                    report_id: report.report_id,
                    reason: report.reason,
                    review_id: report.review.review_id
                }
            });

        } catch (error) {
            console.error("Error al eliminar reporte:", error);
            return res.status(500).json({ message: "Error interno al eliminar reporte" });
        }
    }

    // Eliminar todos los reportes de una reseña específica
    async deleteReportsForReview(req: Request, res: Response): Promise<Response> {
        const { reviewId } = req.params;

        try {
            const reportRepo = AppDataSource.getRepository(ReviewReport);

            // Encontrar todos los reportes de la reseña
            const reports = await reportRepo.find({
                where: { review: { review_id: parseInt(reviewId) } }
            });

            if (reports.length === 0) {
                return res.status(404).json({ message: "No se encontraron reportes para esta reseña" });
            }

            // Eliminar todos los reportes
            await reportRepo.remove(reports);

            return res.status(200).json({
                message: `${reports.length} reporte(s) eliminado(s) correctamente`,
                deletedReportsCount: reports.length,
                review_id: parseInt(reviewId)
            });

        } catch (error) {
            console.error("Error al eliminar reportes de reseña:", error);
            return res.status(500).json({ message: "Error interno al eliminar reportes" });
        }
    }
}