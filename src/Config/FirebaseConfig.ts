import * as admin from 'firebase-admin';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

try {
    // Opción 1: Usar variables de entorno
    if (process.env.FIREBASE_PROJECT_ID) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
            })
        });
    }
    // Opción 2: Usar archivo de credenciales
    else {
        const serviceAccountPath = path.resolve(__dirname, '../config/firebase-service-account.json');
        if (fs.existsSync(serviceAccountPath)) {
            const serviceAccount = require(serviceAccountPath);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } else {
            throw new Error('Archivo de credenciales de Firebase no encontrado');
        }
    }
} catch (error) {
    console.error('Error al inicializar Firebase Admin:', error);
}

export default admin;