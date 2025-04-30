import axios from 'axios';
import sharp from 'sharp';

// Descargar imagen como Buffer
async function getImageBuffer(imageUrl: string): Promise<Buffer> {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary');
}

// Recorta una parte de la imagen
async function cropImage(buffer: Buffer, cropWidth: number, cropHeight: number, left: number, top: number): Promise<Buffer> {
    const croppedImage = await sharp(buffer)
        .extract({ width: cropWidth, height: cropHeight, left, top })
        .toBuffer();
    return croppedImage;
}

// Método principal
export async function getRepresentativeColorArea(imageUrl: string): Promise<Buffer> {
    try {
        const imageBuffer = await getImageBuffer(imageUrl);

        // Leemos tamaño de la imagen primero
        const metadata = await sharp(imageBuffer).metadata();
        const width = metadata.width || 0;
        const height = metadata.height || 0;

        if (width === 0 || height === 0) {
            throw new Error('No se pudo obtener el tamaño de la imagen');
        }

        // Coordenadas aproximadas para recorte
        const cropWidth = Math.floor(width * 0.1);  // 10% del ancho
        const cropHeight = Math.floor(height * 0.1); // 10% del alto
        const left = Math.floor(width * 0.4);        // empieza en 40% del ancho
        const top = Math.floor(height * 0.5);         // empieza en 50% del alto (más bajo)

        const croppedImageBuffer = await cropImage(imageBuffer, cropWidth, cropHeight, left, top);
        return croppedImageBuffer;
    } catch (error) {
        console.error('Error al recortar la imagen:', error);
        throw new Error('No se pudo recortar la imagen');
    }
}
