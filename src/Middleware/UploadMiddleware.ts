// src/Middleware/UploadMiddleware.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Carpeta temporal donde multer guardará los archivos
const uploadPath = 'uploads';
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath);
}

const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
        cb(null, uploadPath);
    },
    filename: function (_req, file, cb) {
        const ext = path.extname(file.originalname);
        const name = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
        cb(null, name);
    }
});

const upload = multer({ storage });

export const uploadMultiple = upload.array('files');
export const uploadSingle = upload.single('file');