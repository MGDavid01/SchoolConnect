// Script para probar la conexión con Cloudinary
require('dotenv').config();
const cloudinary = require('cloudinary').v2;

console.log('🔍 Verificando configuración de Cloudinary...');

// Verificar variables de entorno
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

console.log('📋 Variables de entorno:');
console.log('- CLOUDINARY_CLOUD_NAME:', cloudName ? '✅ Configurado' : '❌ No configurado');
console.log('- CLOUDINARY_API_KEY:', apiKey ? '✅ Configurado' : '❌ No configurado');
console.log('- CLOUDINARY_API_SECRET:', apiSecret ? '✅ Configurado' : '❌ No configurado');

if (!cloudName || !apiKey || !apiSecret) {
  console.error('\n❌ Error: Las credenciales de Cloudinary no están configuradas');
  console.error('Por favor, crea un archivo .env con las siguientes variables:');
  console.error('CLOUDINARY_CLOUD_NAME=tu_cloud_name');
  console.error('CLOUDINARY_API_KEY=tu_api_key');
  console.error('CLOUDINARY_API_SECRET=tu_api_secret');
  process.exit(1);
}

// Configurar Cloudinary
cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
});

// Probar conexión
async function testCloudinary() {
  try {
    console.log('\n🔄 Probando conexión con Cloudinary...');
    
    // Intentar obtener información de la cuenta
    const result = await cloudinary.api.ping();
    console.log('✅ Conexión exitosa con Cloudinary');
    console.log('📊 Información de la cuenta:', result);
    
  } catch (error) {
    console.error('❌ Error al conectar con Cloudinary:', error.message);
    console.error('Verifica que tus credenciales sean correctas');
  }
}

testCloudinary(); 