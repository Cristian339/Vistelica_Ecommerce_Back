import { Request, Response } from 'express';
import { StyleService } from '../Service/StyleService';
import { uploadImage } from "../Config/Cloudinary";
import { CategoryService } from "../Service/CategoryService";
import { StyleRepository } from '../Repository/StyleRepository';
import { ProductService } from "../Service/ProductService";
import { Products } from "../Entities/Products";

export class StyleController {
    private styleService = new StyleService();
    private categoryService = new CategoryService();
    private styleRepository = new StyleRepository();
    private productService = new ProductService();

    constructor() {
        this.create = this.create.bind(this);
        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    async create(req: Request, res: Response): Promise<Response> {
        console.log('req.files:', req.files);
        console.log('req.body:', req.body);

        try {
            // Parse the data from the request body
            const styleData: any = req.body.data ? JSON.parse(req.body.data) : req.body;

            // Validate required fields
            const requiredFields = ['name', 'description', 'category_id'];
            for (const field of requiredFields) {
                if (!styleData[field]) {
                    return res.status(400).json({ error: `Falta el campo obligatorio: ${field}` });
                }
            }

            const { name, description, category_id, products } = styleData;



            // Fetch products by their IDs
            const associatedProducts = products && Array.isArray(products)
                ? await Promise.all(products.map((id: number) => this.productService.getProductById(id)))
                : [];

            // Extract product IDs from associatedProducts
            const productIds = associatedProducts
                .filter((product) => product !== null) // Remove null values
                .map((product) => product!.product_id); // Extract product IDs

            console.log('Product IDs:', productIds);
            // Process images and upload to Cloudinary
            const uploadedImages: { image_url: string, is_main: boolean }[] = [];
            console.log('Body recibido (antes del parseo):', req.body);
            console.log('Archivos recibidos:', req.files);

            if (req.files && Array.isArray(req.files)) {
                console.log('Archivos recibidos:', req.files); // Verifica si los archivos están presentes

                for (let i = 0; i < req.files.length; i++) {
                    const file: any = req.files[i];

                    if (!file || !file.path) {
                        console.error(`El archivo en la posición ${i} no tiene una ruta válida.`);
                        continue; // Salta al siguiente archivo si no es válido
                    }

                    try {
                        const imageUrl = await uploadImage('styles', file.path);
                        uploadedImages.push({
                            image_url: imageUrl,
                            is_main: i === 0,
                        });
                        console.log(`Imagen subida correctamente: ${imageUrl}`);
                    } catch (error) {
                        console.error(`Error al subir la imagen del archivo ${file.path}:`, error);
                    }
                }
            } else {
                console.error('No se encontraron archivos en la solicitud.');
            }

            // Create the style
            const style = await this.styleService.createStyle({
                name,
                description,
                category_id: category_id,
                styleImages: uploadedImages,
                products: productIds,
            });

            return res.status(201).json(style);
        } catch (error) {
            console.error('Error al crear el estilo:', error);
            return res.status(500).json({ msg: 'Error creando el estilo', error: (error as Error).message });
        }
    }




    async getAll(req: Request, res: Response): Promise<Response> {
        try {
            const styles = await this.styleService.getAllStyles();
            return res.status(200).json(styles);
        } catch (error) {
            return res.status(500).json({ message: 'Error obteniendo los estilos', error });
        }
    }

    async getById(req: Request, res: Response): Promise<Response> {
        try {
            const { styleId } = req.params;
            const style = await this.styleService.getStyleById(Number(styleId));

            if (!style) {
                return res.status(404).json({ message: "Estilo no encontrado" });
            }

            // Fetch related products
            const relatedProducts = await this.styleService.getProductsByStyleId(Number(styleId));

            return res.status(200).json({
                ...style,
                relatedProducts,
            });
        } catch (error) {
            console.error("Error al obtener el estilo:", error);
            return res.status(500).json({
                message: "Error al obtener el estilo",
                error: (error as Error).message
            });
        }
    }

    async update(req: Request, res: Response): Promise<Response> {
        try {
            const style = await this.styleService.updateStyle(Number(req.params.id), req.body);
            return res.status(200).json(style);
        } catch (error) {
            return res.status(500).json({ message: 'Error actualizando el estilo', error });
        }
    }

    async delete(req: Request, res: Response): Promise<Response> {
        try {
            const style = await this.styleService.deleteStyle(Number(req.params.id));
            return res.status(200).json(style);
        } catch (error) {
            return res.status(500).json({ message: 'Error eliminando el estilo', error });
        }
    }
}
