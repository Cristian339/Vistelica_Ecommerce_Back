import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import * as fs from "fs";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


export const uploadImage = async (subFolder: string, filePath: string): Promise<string> => {
    try {
        const folderPath = `vistelica/${subFolder}`; // Asegurar que todas las imágenes vayan a /vistelica

        const result = await cloudinary.uploader.upload(filePath, {
            folder: folderPath
        });
        fs.unlinkSync(filePath);
        return result.secure_url; // Devuelve la URL de la imagen en Cloudinary
    } catch (error) {
        console.error('Error al subir la imagen:', error);
        throw new Error('No se pudo subir la imagen');
    }
};
