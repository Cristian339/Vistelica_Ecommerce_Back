import { Request, Response } from 'express';
import { getRepresentativeColorArea } from "../Service/colorDetector"; // OJO: ahora llamamos al nuevo método
import { Color } from '../Entities/Products'; // Aunque Color ya no lo usaríamos aquí

export class ColorDetectionController {
    async detectColor(req: Request, res: Response): Promise<Response> {
        try {
            const { imageUrl } = req.body;

            if (!imageUrl) {
                return res.status(400).json({ error: 'Se requiere la URL de la imagen (imageUrl)' });
            }

            const croppedImageBuffer = await getRepresentativeColorArea(imageUrl);

            // Convertimos a base64 para devolverlo fácilmente
            const base64Image = `data:image/png;base64,${croppedImageBuffer.toString('base64')}`;

            return res.status(200).json({ croppedImage: base64Image });
        } catch (error) {
            console.error('Error al recortar la imagen:', error);
            return res.status(500).json({
                error: 'Error al procesar la imagen',
                details: (error as Error).message
            });
        }
    }
}
