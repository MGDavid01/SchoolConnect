# SchoolConnect

Aplicación móvil para conectar estudiantes y facilitar la comunicación académica.

## Configuración de Cloudinary

Para usar la funcionalidad de subida de imágenes, necesitas configurar Cloudinary:

### 1. Crear cuenta en Cloudinary
- Ve a [cloudinary.com](https://cloudinary.com)
- Crea una cuenta gratuita
- Obtén tus credenciales del Dashboard

### 2. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/schoolconnect

# Server Configuration
PORT=4000
```

### 3. Reemplazar las credenciales
- `CLOUDINARY_CLOUD_NAME`: Tu nombre de cloud de Cloudinary
- `CLOUDINARY_API_KEY`: Tu API Key de Cloudinary
- `CLOUDINARY_API_SECRET`: Tu API Secret de Cloudinary

## Instalación

```bash
npm install
```

## Ejecutar el proyecto

```bash
# Backend
npm run server

# Frontend (en otra terminal)
npm start
```

## Funcionalidades

- ✅ Subida de imágenes a Cloudinary
- ✅ Vista previa de imágenes
- ✅ Modal de imagen completa
- ✅ Texto expandible
- ✅ Interfaz moderna tipo Facebook 