import express, { Request, Response } from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary';
import { API_URL } from '../constants/api';

const router = express.Router();

// Extender la interfaz Request para incluir el archivo
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Configuración de multer para manejar archivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
  },
  fileFilter: (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Solo permitir imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  },
});

// Ruta para subir imagen a Cloudinary
router.post('/upload-image', upload.single('image'), async (req: MulterRequest, res: Response) => {
  console.log('🚀 Iniciando ruta de subida de imagen...');
  
  try {
    if (!req.file) {
      console.log('❌ No se proporcionó archivo');
      return res.status(400).json({ 
        success: false, 
        message: 'No se proporcionó ninguna imagen' 
      });
    }

    console.log('📁 Archivo recibido:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer ? '✅ Presente' : '❌ Ausente'
    });

    // Validar que las credenciales de Cloudinary estén configuradas
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    
    console.log('🔑 Credenciales Cloudinary:', {
      cloudName: cloudName ? '✅ Configurado' : '❌ No configurado',
      apiKey: apiKey ? '✅ Configurado' : '❌ No configurado',
      apiSecret: apiSecret ? '✅ Configurado' : '❌ No configurado'
    });

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('❌ Error: Credenciales de Cloudinary no configuradas');
      return res.status(500).json({
        success: false,
        message: 'Error de configuración del servidor'
      });
    }

    console.log('📤 Iniciando subida de imagen a Cloudinary...');
    console.log('📁 Tamaño del archivo:', req.file.size, 'bytes');
    console.log('📋 Tipo MIME:', req.file.mimetype);

    // Convertir el buffer a base64
    console.log('🔄 Convirtiendo buffer a base64...');
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    console.log('✅ Conversión completada, dataURI length:', dataURI.length);

    console.log('☁️ Subiendo a Cloudinary...');
    // Subir a Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'schoolconnect',
      resource_type: 'auto',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' }, // Limitar tamaño máximo
        { quality: 'auto', fetch_format: 'auto' } // Optimización automática
      ]
    });

    console.log('✅ Imagen subida exitosamente a Cloudinary');
    console.log('🔗 URL:', result.secure_url);
    console.log('🆔 Public ID:', result.public_id);

    res.json({
      success: true,
      imageUrl: result.secure_url,
      publicId: result.public_id,
      message: 'Imagen subida exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al subir imagen:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    
    // Manejar errores específicos de Cloudinary
    if (error instanceof Error) {
      if (error.message.includes('Invalid api_key')) {
        return res.status(500).json({
          success: false,
          message: 'Error de configuración: API key inválida'
        });
      }
      if (error.message.includes('Invalid cloud_name')) {
        return res.status(500).json({
          success: false,
          message: 'Error de configuración: Cloud name inválido'
        });
      }
    }

    res.status(500).json({
      success: false,
      message: 'Error al subir la imagen. Verifica la configuración de Cloudinary.',
      error: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
});

// Ruta para eliminar imagen de Cloudinary
router.delete('/delete-image/:publicId', async (req: Request, res: Response) => {
  try {
    const { publicId } = req.params;
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    res.json({
      success: true,
      message: 'Imagen eliminada exitosamente',
      result
    });

  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la imagen'
    });
  }
});

export default router; 