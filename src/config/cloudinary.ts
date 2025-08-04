import { v2 as cloudinary } from 'cloudinary';

// Validar que las credenciales estén configuradas
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Error: Las credenciales de Cloudinary no están configuradas');
  console.error('Por favor, configura las siguientes variables de entorno:');
  console.error('- CLOUDINARY_CLOUD_NAME');
  console.error('- CLOUDINARY_API_KEY');
  console.error('- CLOUDINARY_API_SECRET');
}

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: cloudName || 'demo',
  api_key: apiKey || 'demo',
  api_secret: apiSecret || 'demo',
});

export default cloudinary; 